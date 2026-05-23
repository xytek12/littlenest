import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://placeholder-project.supabase.co';
const supabaseKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'placeholder-publishable-key';

export function hasSupabaseEnv() {
  return Boolean(
    process.env.EXPO_PUBLIC_SUPABASE_URL &&
      process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
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
