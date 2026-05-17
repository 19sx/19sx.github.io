-- Run this in your Supabase SQL Editor to create the signups table.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE signups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('student', 'kmu')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed')),
  token UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),

  -- student fields
  name TEXT,
  skill TEXT,
  age_group TEXT,
  parent_email TEXT,

  -- kmu fields
  company TEXT,
  company_type TEXT,

  -- shared fields
  email TEXT NOT NULL,
  city TEXT,
  confirm_email TEXT NOT NULL,

  consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days')
);

-- Index for token lookups on confirm endpoint
CREATE INDEX idx_signups_token ON signups(token);

-- Index for status filtering
CREATE INDEX idx_signups_status ON signups(status);

-- Index for expiry cleanup
CREATE INDEX idx_signups_expires ON signups(expires_at);

-- Auto-delete expired pending signups (run periodically or via pg_cron)
CREATE OR REPLACE FUNCTION cleanup_expired_signups()
RETURNS void AS $$
BEGIN
  DELETE FROM signups WHERE status = 'pending' AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- If you have pg_cron enabled, uncomment:
-- SELECT cron.schedule('cleanup-expired-signups', '0 3 * * *', $$SELECT cleanup_expired_signups()$$);
