-- Add username column to profiles
-- Username is the primary identifier for users in Velo

ALTER TABLE profiles ADD COLUMN username TEXT UNIQUE;

-- Add index for fast username lookups
CREATE INDEX idx_profiles_username ON profiles(username) WHERE username IS NOT NULL;

-- Add index for nim_address lookups (for syncing returning users)
CREATE INDEX idx_profiles_nim_address ON profiles(nim_address) WHERE nim_address IS NOT NULL;
