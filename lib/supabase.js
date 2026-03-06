// ============================================================
// SUPABASE CLIENT
// For file storage (images) uploads
// ============================================================

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️  Supabase credentials not found. Image upload will not work.");
  console.warn("   Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local");
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Storage bucket name for products
export const PRODUCTS_BUCKET = "products";

// Upload image to Supabase Storage
export async function uploadImage(file, folder = "products") {
  if (!supabase) {
    throw new Error("Supabase not configured. Check your .env.local file.");
  }

  try {
    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(PRODUCTS_BUCKET)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(PRODUCTS_BUCKET)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}

// Delete image from Supabase Storage
export async function deleteImage(path) {
  if (!supabase) {
    throw new Error("Supabase not configured.");
  }

  try {
    const { error } = await supabase.storage
      .from(PRODUCTS_BUCKET)
      .remove([path]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Delete image error:", error);
    throw error;
  }
}
