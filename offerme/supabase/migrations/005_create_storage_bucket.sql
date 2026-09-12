-- Create storage bucket for business/shop images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-images',
  'business-images',
  true,
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Public read access for all images
CREATE POLICY "Public read access for business images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'business-images');

-- Authenticated insert access
CREATE POLICY "Authenticated insert for business images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'business-images' AND auth.role() = 'authenticated');

-- Authenticated delete access (own files only)
CREATE POLICY "Authenticated delete own business images"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'business-images' AND auth.uid()::text = (storage.foldername(name))[1]);
