import { supabase } from "./supabase.js";

export async function saveHistoryEntry(
  userId,
  repoName,
  qualityScore,
  analysis,
) {
  if (!userId) return;
  const { error } = await supabase.from("analyzed_repos").insert({
    user_id: userId,
    repo_name: repoName,
    quality_score: qualityScore,
    analysis,
  });
  if (error) console.error("Failed to save history entry:", error.message);
}

export async function fetchHistory(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("analyzed_repos")
    .select("*")
    .eq("user_id", userId)
    .order("analyzed_at", { ascending: true });
  if (error) throw new Error("Could not load your history right now.");
  return data;
}
