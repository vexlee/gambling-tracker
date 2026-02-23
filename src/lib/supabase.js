/**
 * Supabase Client Singleton
 * --------------------------
 * Single point of configuration for the Supabase JS client.
 * Replace the placeholder URL and anon key with your actual Supabase project credentials.
 * These should ideally come from environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
