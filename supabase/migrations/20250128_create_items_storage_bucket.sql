-- Create the items storage bucket for image uploads
-- Bucket is PUBLIC so images can be displayed via getPublicUrl()
-- Security comes from:
-- 1. RLS policies restricting uploads/deletes to own folders
-- 2. Hard-to-guess paths: {user_id}/images/{timestamp}.{ext}
-- 3. user_id is a UUID, not guessable
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, cors)
VALUES ('items', 'items', true, 10485760,
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'],
  '[
    {
      "origins": ["https://omnis-ashen.vercel.app"],
      "methods": ["GET", "PUT", "POST", "DELETE"],
      "headers": ["*"],
      "maxAge": 3600
    }
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types,
  cors = EXCLUDED.cors;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Authenticated users can upload to items bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view own items" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own items" ON storage.objects;
DROP POLICY IF EXISTS "Public can view items bucket images" ON storage.objects;

-- RLS Policies for items storage bucket

-- Allow authenticated users to upload to THEIR OWN folder only
-- Uses storage.foldername() to extract the first path segment (user.id)
CREATE POLICY "Authenticated users can upload to items bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'items'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to view their own images
CREATE POLICY "Authenticated users can view own items"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'items'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own images only
CREATE POLICY "Authenticated users can delete own items"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'items'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public access to images for display in the app
-- This is safe because paths use user.id (UUID) which is not guessable
-- Format: {user_id}/images/{timestamp}.{extension}
CREATE POLICY "Public can view items bucket images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'items');
