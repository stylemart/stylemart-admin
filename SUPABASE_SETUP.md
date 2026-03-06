# Supabase Storage Setup Guide

## Step 1: Get Supabase Credentials

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on **Settings** → **API**
3. Copy these values:
   - **Project URL** (e.g., `https://xyz.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

## Step 2: Create Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Click **New bucket**
3. Name it: `products`
4. Set it to **Public** (so images can be accessed via URL)
5. Click **Create bucket**

## Step 3: Set Storage Policies (Important!)

1. Go to **Storage** → **policies** for the `products` bucket
2. Click **New Policy**
3. Create a policy that allows:
   - **INSERT**: Authenticated users can upload
   - **SELECT**: Public can read (for displaying images)
   - **DELETE**: Authenticated users can delete

Or use this SQL in SQL Editor:

```sql
-- Allow public to read images
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'products');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated Delete" ON storage.objects
FOR DELETE USING (bucket_id = 'products' AND auth.role() = 'authenticated');
```

## Step 4: Add to .env.local

Add these to your `admin-panel/.env.local` file:

```env
# Supabase Storage (for image uploads)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Use `NEXT_PUBLIC_` prefix so these are available in the browser!

## Step 5: Install Dependencies

```bash
cd admin-panel
npm install
```

The `@supabase/supabase-js` package is already added to `package.json`.

## Step 6: Test

1. Start your admin panel: `npm run dev`
2. Go to Products → Add Product
3. Try uploading an image
4. If it works, you'll see the image preview!

## Troubleshooting

### Error: "Supabase not configured"
- Check that `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart the dev server after adding env variables

### Error: "Bucket not found"
- Make sure you created the `products` bucket in Supabase Storage
- Check the bucket name matches exactly: `products`

### Error: "Permission denied"
- Check storage policies are set correctly
- Make sure bucket is set to **Public**

### Images not showing
- Check the bucket is **Public**
- Verify the URL in browser (should be accessible without auth)
