/*
  # Add File Metadata Fields to Lessons Table

  ## Overview
  This migration adds fields to track file metadata for uploaded media in lessons,
  enabling better file management and display.

  ## Changes Made

  ### 1. New Columns Added to lessons Table
  - **file_size**: Stores the size of uploaded files in bytes
  - **file_type**: Stores the MIME type of the uploaded file
  - **original_filename**: Stores the original name of the uploaded file
  - **thumbnail_url**: Stores URL for video thumbnails or image previews

  ### 2. Purpose
  These fields enable:
  - Display of file size information to users
  - Better file type validation and handling
  - Preview generation and display
  - File management and cleanup operations
  - User-friendly display of original file names
*/

-- Add file metadata columns to lessons table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lessons' AND column_name = 'file_size'
  ) THEN
    ALTER TABLE lessons ADD COLUMN file_size bigint DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lessons' AND column_name = 'file_type'
  ) THEN
    ALTER TABLE lessons ADD COLUMN file_type text DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lessons' AND column_name = 'original_filename'
  ) THEN
    ALTER TABLE lessons ADD COLUMN original_filename text DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lessons' AND column_name = 'thumbnail_url'
  ) THEN
    ALTER TABLE lessons ADD COLUMN thumbnail_url text DEFAULT NULL;
  END IF;
END $$;

-- Add index on file_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_lessons_file_type ON lessons(file_type);

-- Add comment to document the fields
COMMENT ON COLUMN lessons.file_size IS 'Size of uploaded file in bytes';
COMMENT ON COLUMN lessons.file_type IS 'MIME type of the uploaded file';
COMMENT ON COLUMN lessons.original_filename IS 'Original filename before upload';
COMMENT ON COLUMN lessons.thumbnail_url IS 'URL for preview thumbnail (videos/images)';
