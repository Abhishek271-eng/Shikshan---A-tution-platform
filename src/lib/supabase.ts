import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Verify whether Supabase is properly configured
export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here' &&
  supabaseUrl.startsWith('http')
);

// Create real client or placeholder client for unconfigured state
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : (createClient(
      'https://placeholder-project.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    ) as SupabaseClient);

/**
 * Storage helpers for private marksheets
 */
export async function uploadTutorDocument(
  userId: string,
  file: File,
  category: string
): Promise<{ path: string; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { path: '', error: new Error('Supabase Storage is not configured. Please supply valid credentials.') };
  }

  // Path format: <userId>/<timestamp>-<sanitizedFileName>
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${userId}/${category}_${Date.now()}_${sanitizedName}`;

  const { error } = await supabase.storage
    .from('tutor-documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || (fileExt === 'pdf' ? 'application/pdf' : 'image/jpeg'),
    });

  if (error) {
    return { path: '', error: new Error(error.message) };
  }

  return { path: filePath, error: null };
}

/**
 * Generate authenticated, time-limited signed URL for private marksheets
 */
export async function getDocumentSignedUrl(filePath: string, expiresInSeconds: number = 300): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase.storage
    .from('tutor-documents')
    .createSignedUrl(filePath, expiresInSeconds);

  if (error || !data) {
    console.error('Failed to create signed URL:', error);
    return null;
  }

  return data.signedUrl;
}
