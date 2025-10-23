/*
  # Add Theme Preference to Profiles

  1. Changes
    - Add `theme_preference` column to `profiles` table
      - Type: text with constraint to only allow 'light' or 'dark'
      - Default: 'dark'
      - Allows users to save and sync their theme preference across devices
  
  2. Notes
    - Safe to run multiple times (uses IF NOT EXISTS pattern)
    - Default theme is 'dark' to match current application design
    - Uses CHECK constraint to ensure only valid theme values
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'theme_preference'
  ) THEN
    ALTER TABLE profiles ADD COLUMN theme_preference text DEFAULT 'dark' CHECK (theme_preference IN ('light', 'dark'));
  END IF;
END $$;
