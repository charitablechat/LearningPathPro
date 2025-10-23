/*
  # Create Storage Buckets and Configure Policies

  ## Overview
  This migration creates storage buckets for course media files and configures
  appropriate security policies for file uploads and access.

  ## Changes Made

  ### 1. Storage Buckets
  - **course-videos**: Stores video files for lessons (MP4, WebM, MOV) - 500MB limit
  - **course-images**: Stores image files for thumbnails and course content (JPG, PNG, GIF, WebP) - 10MB limit
  - **course-documents**: Stores PDF and document files for lessons - 50MB limit

  ### 2. Storage Policies
  Each bucket has the following policies:
  - **Public Read Access**: Anyone can view/download files (for learner access)
  - **Authenticated Upload**: Only authenticated users can upload files
  - **Owner Delete**: Users can delete their own uploaded files
  - **Owner Update**: Users can update their own uploaded files

  ### 3. Security Notes
  - All uploads require authentication
  - File access is public for seamless content delivery
  - Users can only modify files they uploaded
  - RLS is enabled on all storage buckets
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('course-videos', 'course-videos', true, 524288000, ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']),
  ('course-images', 'course-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']),
  ('course-documents', 'course-documents', true, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'])
ON CONFLICT (id) DO NOTHING;

-- Policy: Anyone can view/download files (public read)
CREATE POLICY "Public Access for course videos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'course-videos');

CREATE POLICY "Public Access for course images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'course-images');

CREATE POLICY "Public Access for course documents"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'course-documents');

-- Policy: Authenticated users can upload files
CREATE POLICY "Authenticated users can upload videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'course-videos');

CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'course-images');

CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'course-documents');

-- Policy: Users can update their own files
CREATE POLICY "Users can update own videos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'course-videos' AND owner::text = (auth.uid())::text)
  WITH CHECK (bucket_id = 'course-videos' AND owner::text = (auth.uid())::text);

CREATE POLICY "Users can update own images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'course-images' AND owner::text = (auth.uid())::text)
  WITH CHECK (bucket_id = 'course-images' AND owner::text = (auth.uid())::text);

CREATE POLICY "Users can update own documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'course-documents' AND owner::text = (auth.uid())::text)
  WITH CHECK (bucket_id = 'course-documents' AND owner::text = (auth.uid())::text);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete own videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'course-videos' AND owner::text = (auth.uid())::text);

CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'course-images' AND owner::text = (auth.uid())::text);

CREATE POLICY "Users can delete own documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'course-documents' AND owner::text = (auth.uid())::text);
