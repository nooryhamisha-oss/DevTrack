import { supabase } from "./supabase.js";

function generateSlug() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8);
}

export async function createSnapshot(userId, username, data) {
  const id = generateSlug();
  const { error } = await supabase
    .from("public_snapshots")
    .insert({ id, user_id: userId, username, data });
  if (error) throw error;
  return id;
}

export async function fetchSnapshot(id) {
  const { data, error } = await supabase
    .from("public_snapshots")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error("This shared link doesn't exist or expired.");
  return data;
}
