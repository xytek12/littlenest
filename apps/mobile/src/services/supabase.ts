import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://placeholder-project.supabase.co';
const supabaseKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'placeholder-publishable-key';

// Treat obvious placeholder values (from .env.example / ENV_LOCAL_EDIT_ME.txt)
// as "not configured" so the app shows the friendly missing-env message instead
// of failing at the network layer with an opaque error.
function isPlaceholder(value: string | undefined) {
  if (!value) return true;
  const v = value.trim();
  if (v.length === 0) return true;
  const lower = v.toLowerCase();
  return (
    lower.startsWith('paste_') ||
    lower.startsWith('placeholder') ||
    lower.includes('your-publishable') ||
    lower.includes('your-project-ref') ||
    lower.includes('edit_me')
  );
}

export function hasSupabaseEnv() {
  return (
    !isPlaceholder(process.env.EXPO_PUBLIC_SUPABASE_URL) &&
    !isPlaceholder(process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  );
}

export function getSupabaseEnvError() {
  return 'Missing Supabase public environment variables.';
}

const storage =
  typeof process !== 'undefined' && process.env.JEST_WORKER_ID
    ? undefined
    : require('@react-native-async-storage/async-storage').default;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
