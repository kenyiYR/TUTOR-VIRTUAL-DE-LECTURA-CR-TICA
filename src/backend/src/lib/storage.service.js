import supabase from './supabase.js';

export async function uploadBuffer({ bucket, path, buffer, contentType }) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, { contentType, upsert: false });
  if (error) throw new Error(error.message);
  return data.path; // path interno del bucket
}

export function publicUrl({ bucket, path }) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
