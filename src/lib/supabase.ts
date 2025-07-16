import { createClientComponentClient, createServerComponentClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';

// Client-side Supabase client
export const createClient = () => {
  return createClientComponentClient<Database>();
};

// Server-side Supabase client
export const createServerClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });
};

// Supabase configuration for real-time features
export const realtimeConfig = {
  channels: {
    messages: 'realtime:messages',
    typing: 'realtime:typing_indicators',
    presence: 'realtime:user_presence',
    calls: 'realtime:calls',
  },
};

// Helper function for uploading files
export const uploadFile = async (
  supabase: ReturnType<typeof createClient>,
  bucket: string,
  path: string,
  file: File,
  onProgress?: (progress: number) => void
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return data;
};

// Helper function for getting file URL
export const getFileUrl = (
  supabase: ReturnType<typeof createClient>,
  bucket: string,
  path: string
) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
};

// Helper function for deleting files
export const deleteFile = async (
  supabase: ReturnType<typeof createClient>,
  bucket: string,
  paths: string[]
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .remove(paths);

  if (error) {
    throw error;
  }

  return data;
};