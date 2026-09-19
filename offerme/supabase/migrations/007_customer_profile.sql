-- Customer profile fields and private avatar storage.
ALTER TABLE public_users
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS avatar_path text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-avatars', 'profile-avatars', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Browser clients do not access this bucket directly. All file operations go
-- through authenticated API routes using the service role key.
