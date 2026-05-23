import type { TrackingLogType } from '../types/domain';
import { getSupabaseEnvError, hasSupabaseEnv, supabase } from './supabase';

function requireSupabaseEnv() {
  if (!hasSupabaseEnv()) {
    throw new Error(getSupabaseEnvError());
  }
}

export async function signInAdmin(email: string, password: string) {
  requireSupabaseEnv();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function getCurrentSession() {
  requireSupabaseEnv();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function insertTrackingLog(input: {
  childId: string;
  ownerId: string;
  logType: TrackingLogType;
  startedAt: string;
  endedAt?: string;
  note?: string;
}) {
  requireSupabaseEnv();

  const { data, error } = await supabase
    .from('tracking_logs')
    .insert({
      child_id: input.childId,
      owner_id: input.ownerId,
      log_type: input.logType,
      started_at: input.startedAt,
      ended_at: input.endedAt,
      note: input.note,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
