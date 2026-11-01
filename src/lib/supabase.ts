// Deprecated: Shikshan uses a local MySQL database via server/ REST API.
// Cloud database connections (Supabase/Firebase) are prohibited per architecture requirements.
export const isSupabaseConfigured = false;
export const supabase = null as any;
export const getDocumentSignedUrl = async () => null;
