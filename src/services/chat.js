import { supabase } from "./supabase.js";
export async function fetchChatHistory(userId) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("role, content, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(60);
  if (error) throw error;
  return data.map((m) => ({ role: m.role, content: m.content }));
}

export async function saveChatMessage(userId, role, content) {
  const { error } = await supabase.from("chat_messages").insert({
    user_id: userId,
    role,
    content,
  });
  if (error) throw error;
}
