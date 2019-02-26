-- This script creates 'application' role and 'web_app' user.
-- You must provide password in 'pw' variable.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'application') THEN
    CREATE ROLE application;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO application;
    GRANT SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO application;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'web_app') THEN
    CREATE USER web_app WITH
      PASSWORD 'default'
      IN ROLE application;
  END IF;
END$$;

ALTER USER web_app WITH PASSWORD :'pw';
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO application;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, UPDATE ON SEQUENCES TO application;
