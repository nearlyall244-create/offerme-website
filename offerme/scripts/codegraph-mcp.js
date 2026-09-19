#!/usr/bin/env node
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const dbPath = path.join(projectRoot, ".codegraph", "codegraph.db");

let buffer = Buffer.alloc(0);

process.stdin.on("data", (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  drainMessages();
});

process.stdin.on("end", () => process.exit(0));

function drainMessages() {
  while (true) {
    const headerEnd = buffer.indexOf("\r\n\r\n");
    if (headerEnd === -1) return;

    const header = buffer.slice(0, headerEnd).toString("utf8");
    const lengthMatch = header.match(/content-length:\s*(\d+)/i);
    if (!lengthMatch) {
      buffer = buffer.slice(headerEnd + 4);
      continue;
    }

    const bodyLength = Number(lengthMatch[1]);
    const bodyStart = headerEnd + 4;
    const bodyEnd = bodyStart + bodyLength;
    if (buffer.length < bodyEnd) return;

    const body = buffer.slice(bodyStart, bodyEnd).toString("utf8");
    buffer = buffer.slice(bodyEnd);

    try {
      const message = JSON.parse(body);
      handleMessage(message);
    } catch (error) {
      sendError(null, -32700, `Parse error: ${error.message}`);
    }
  }
}

function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`);
}

function sendResult(id, result) {
  send({ jsonrpc: "2.0", id, result });
}

function sendError(id, code, message) {
  send({ jsonrpc: "2.0", id, error: { code, message } });
}

function handleMessage(message) {
  if (message.method?.startsWith("notifications/")) return;

  try {
    switch (message.method) {
      case "initialize":
        return sendResult(message.id, {
          protocolVersion: message.params?.protocolVersion ?? "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "offerme-codegraph", version: "0.1.0" },
        });
      case "tools/list":
        return sendResult(message.id, { tools: toolList() });
      case "tools/call":
        return sendResult(message.id, callTool(message.params));
      default:
        return sendError(message.id, -32601, `Unknown method: ${message.method}`);
    }
  } catch (error) {
    return sendError(message.id, -32000, error.stack || error.message);
  }
}

function openDb() {
  if (!fs.existsSync(dbPath)) {
    throw new Error(`CodeGraph database not found at ${dbPath}`);
  }
  return new DatabaseSync(dbPath, { readOnly: true });
}

function clampLimit(value, fallback = 25, max = 100) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(Math.floor(parsed), max);
}

function rowsToContent(data) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

function toolList() {
  return [
    {
      name: "codegraph_overview",
      description: "Summarize the OfferMe CodeGraph index, including metadata, languages, node kinds, and largest files.",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "codegraph_search_symbols",
      description: "Search indexed symbols by name or qualified name.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Symbol text to search for." },
          kind: { type: "string", description: "Optional node kind filter, such as function, route, constant, or import." },
          limit: { type: "number", description: "Maximum results, default 25, max 100." },
        },
        required: ["query"],
      },
    },
    {
      name: "codegraph_file_symbols",
      description: "List symbols indexed from a specific repository file path.",
      inputSchema: {
        type: "object",
        properties: {
          file_path: { type: "string", description: "Repo-relative file path, for example src/App.jsx." },
          limit: { type: "number", description: "Maximum results, default 100, max 200." },
        },
        required: ["file_path"],
      },
    },
    {
      name: "codegraph_imports",
      description: "List import/dependency edges for a specific file.",
      inputSchema: {
        type: "object",
        properties: {
          file_path: { type: "string", description: "Repo-relative file path, for example src/App.jsx." },
          limit: { type: "number", description: "Maximum results, default 100, max 200." },
        },
        required: ["file_path"],
      },
    },
    {
      name: "codegraph_important_files",
      description: "List large/high-node-count files to orient codebase understanding.",
      inputSchema: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Maximum results, default 30, max 100." },
        },
      },
    },
  ];
}

function callTool(params = {}) {
  const name = params.name;
  const args = params.arguments ?? {};

  switch (name) {
    case "codegraph_overview":
      return rowsToContent(codegraphOverview());
    case "codegraph_search_symbols":
      return rowsToContent(searchSymbols(args));
    case "codegraph_file_symbols":
      return rowsToContent(fileSymbols(args));
    case "codegraph_imports":
      return rowsToContent(fileImports(args));
    case "codegraph_important_files":
      return rowsToContent(importantFiles(args));
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function codegraphOverview() {
  const db = openDb();
  try {
    return {
      database: path.relative(projectRoot, dbPath),
      metadata: db.prepare("SELECT key, value FROM project_metadata ORDER BY key").all(),
      languages: db.prepare("SELECT language, COUNT(*) AS files, SUM(size) AS bytes, SUM(node_count) AS nodes FROM files GROUP BY language ORDER BY files DESC").all(),
      nodeKinds: db.prepare("SELECT kind, COUNT(*) AS count FROM nodes GROUP BY kind ORDER BY count DESC").all(),
      totals: {
        files: db.prepare("SELECT COUNT(*) AS count FROM files").get().count,
        nodes: db.prepare("SELECT COUNT(*) AS count FROM nodes").get().count,
        edges: db.prepare("SELECT COUNT(*) AS count FROM edges").get().count,
        unresolvedRefs: db.prepare("SELECT COUNT(*) AS count FROM unresolved_refs").get().count,
      },
    };
  } finally {
    db.close();
  }
}

function searchSymbols({ query, kind, limit }) {
  if (!query || typeof query !== "string") throw new Error("query is required");
  const db = openDb();
  try {
    const maxRows = clampLimit(limit);
    const like = `%${query.toLowerCase()}%`;
    if (kind) {
      return db.prepare(`
        SELECT kind, name, qualified_name, file_path, start_line, end_line, signature
        FROM nodes
        WHERE kind = ? AND (lower(name) LIKE ? OR lower(qualified_name) LIKE ?)
        ORDER BY file_path, start_line
        LIMIT ?
      `).all(kind, like, like, maxRows);
    }
    return db.prepare(`
      SELECT kind, name, qualified_name, file_path, start_line, end_line, signature
      FROM nodes
      WHERE lower(name) LIKE ? OR lower(qualified_name) LIKE ?
      ORDER BY file_path, start_line
      LIMIT ?
    `).all(like, like, maxRows);
  } finally {
    db.close();
  }
}

function fileSymbols({ file_path, limit }) {
  if (!file_path || typeof file_path !== "string") throw new Error("file_path is required");
  const db = openDb();
  try {
    return db.prepare(`
      SELECT kind, name, qualified_name, start_line, end_line, signature, is_exported
      FROM nodes
      WHERE file_path = ?
      ORDER BY start_line, kind
      LIMIT ?
    `).all(file_path.replaceAll("\\", "/"), clampLimit(limit, 100, 200));
  } finally {
    db.close();
  }
}

function fileImports({ file_path, limit }) {
  if (!file_path || typeof file_path !== "string") throw new Error("file_path is required");
  const db = openDb();
  try {
    const fileId = `file:${file_path.replaceAll("\\", "/")}`;
    return db.prepare(`
      SELECT
        e.kind,
        e.source,
        e.target,
        e.line,
        n.kind AS target_kind,
        n.name AS target_name,
        n.file_path AS target_file_path,
        n.start_line AS target_start_line
      FROM edges e
      LEFT JOIN nodes n ON e.target = n.id
      WHERE e.source = ?
      ORDER BY e.line, e.kind, e.target
      LIMIT ?
    `).all(fileId, clampLimit(limit, 100, 200));
  } finally {
    db.close();
  }
}

function importantFiles({ limit }) {
  const db = openDb();
  try {
    return db.prepare(`
      SELECT path, language, size, node_count, errors, generated
      FROM files
      ORDER BY node_count DESC, size DESC
      LIMIT ?
    `).all(clampLimit(limit, 30, 100));
  } finally {
    db.close();
  }
}
