-- Migration: Add app_role to user_profiles
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
--
-- App roles control what a user can see and do inside the dashboard:
--   owner   → Full access including billing (workspace creator)
--   admin   → Full access except billing
--   manager → All team data, no billing/team management
--   member  → Own data only (default for invited teammates)
--   viewer  → Read-only access
--
-- New signups get 'owner' (they own their own account).
-- When team invites are built, invited users are assigned a role.

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS app_role TEXT NOT NULL DEFAULT 'owner';

-- Constrain to valid values
ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_app_role_check;

ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_app_role_check
  CHECK (app_role IN ('owner', 'admin', 'manager', 'member', 'viewer'));

-- Index for fast role lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_app_role
  ON user_profiles (app_role);

-- Back-fill: existing users → owner
UPDATE user_profiles SET app_role = 'owner' WHERE app_role IS NULL;
