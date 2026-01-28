-- Create the items storage bucket for image uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('items', 'items', false, 10485760, ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for items storage bucket
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload to items bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'items'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to view their own images
CREATE POLICY "Authenticated users can view own items"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'items'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own images
CREATE POLICY "Authenticated users can delete own items"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'items'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public access to images (for displaying in the app)
-- Note: The actual paths are random so they're not easily guessable
CREATE POLICY "Public can view items bucket images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'items');
