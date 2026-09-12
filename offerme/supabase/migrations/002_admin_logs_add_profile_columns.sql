-- Add name and email columns to admin_logs for storing admin profile info

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'admin_logs'::regclass AND attname = 'name') THEN
    ALTER TABLE admin_logs ADD COLUMN name text;
  END IF;

  IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'admin_logs'::regclass AND attname = 'email') THEN
    ALTER TABLE admin_logs ADD COLUMN email text;
  END IF;
END $$;
