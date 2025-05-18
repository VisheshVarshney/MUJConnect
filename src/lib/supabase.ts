import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    storageKey: 'supabase.auth.token',
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Media URL cache
const mediaUrlCache = new Map<string, string>();

export const getMediaUrl = (filePath: string): string => {
  if (!filePath) return '';
  
  if (mediaUrlCache.has(filePath)) {
    return mediaUrlCache.get(filePath)!;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('post-media')
    .getPublicUrl(filePath);

  mediaUrlCache.set(filePath, publicUrl);
  return publicUrl;
};

// Clear cache when needed (e.g., after uploads)
export const clearMediaCache = () => {
  mediaUrlCache.clear();
};