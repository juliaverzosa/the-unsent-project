import { supabase } from "../lib/supabase";
import { isSupabaseConfigured } from "../lib/supabase";
import { getLocalProfile, saveLocalProfile } from "./local_store";

function isMissingProfilesTable(error) {
  return error?.code === "PGRST205" ||
    error?.message?.includes("public.profiles");
}

export async function getProfile(userId) {
  if (!isSupabaseConfigured) return getLocalProfile(userId);
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) {
    if (isMissingProfilesTable(error)) return { ...getLocalProfile(userId), id: userId };
    throw error;
  }
  return data;
}

export async function saveProfile(userId, updates) {
  if (!isSupabaseConfigured) return saveLocalProfile({ ...getLocalProfile(userId), id: userId, ...updates });
  const { data, error } = await supabase.from("profiles")
    .upsert({ id: userId, ...updates }, { onConflict: "id" }).select().single();
  if (error) {
    if (isMissingProfilesTable(error)) {
      return saveLocalProfile({ ...getLocalProfile(userId), id: userId, ...updates });
    }
    throw error;
  }
  return data;
}
