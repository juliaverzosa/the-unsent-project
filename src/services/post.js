import { supabase } from "../lib/supabase";
import { isSupabaseConfigured } from "../lib/supabase";
import { getLocalBookmarks, getLocalPosts, saveLocalBookmarks, saveLocalPosts } from "./local_store";

export async function getPosts() {
  if (!isSupabaseConfigured) return getLocalPosts();
  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles(username, bio, avatar_color)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createPost({ content, emotion, anonymous, userId }) {
  if (!isSupabaseConfigured) {
    const post = {
      id: `local-${Date.now()}`,
      user_id: userId,
      content,
      emotion,
      is_anonymous: anonymous,
      created_at: new Date().toISOString(),
      profiles: { username: "Guest", avatar_color: "#c85f52" },
    };
    saveLocalPosts([post, ...getLocalPosts()]);
    return post;
  }
  const { data, error } = await supabase
    .from("posts")
    .insert({ content, emotion, is_anonymous: anonymous, user_id: userId })
    .select("*, profiles(username, bio, avatar_color)")
    .single();
  if (error) throw error;
  return data;
}

export async function deletePost(postId) {
  if (!isSupabaseConfigured) {
    saveLocalPosts(getLocalPosts().filter((post) => post.id !== postId));
    return;
  }
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw error;
}

export async function toggleReaction(postId, userId, reaction) {
  if (!isSupabaseConfigured) return true;
  const { data: existing, error: lookupError } = await supabase
    .from("reactions").select("id").eq("post_id", postId).eq("user_id", userId).maybeSingle();
  if (lookupError) throw lookupError;

  if (existing) {
    const { error } = await supabase.from("reactions").delete().eq("id", existing.id);
    if (error) throw error;
    return false;
  }

  const { error } = await supabase.from("reactions").insert({
    post_id: postId, user_id: userId, reaction_type: reaction,
  });
  if (error) throw error;
  return true;
}

export async function getBookmarks(userId) {
  if (!isSupabaseConfigured) {
    const saved = getLocalBookmarks();
    return getLocalPosts().filter((post) => saved.includes(post.id));
  }
  const { data, error } = await supabase
    .from("bookmarks").select("post_id, posts(*, profiles(username, bio, avatar_color))")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((item) => item.posts).filter(Boolean);
}

export async function toggleBookmark(postId, userId) {
  if (!isSupabaseConfigured) {
    const saved = getLocalBookmarks();
    const next = saved.includes(postId) ? saved.filter((id) => id !== postId) : [...saved, postId];
    saveLocalBookmarks(next);
    return next.includes(postId);
  }
  const { data: existing, error: lookupError } = await supabase
    .from("bookmarks").select("post_id").eq("post_id", postId).eq("user_id", userId).maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) {
    const { error } = await supabase.from("bookmarks").delete().eq("post_id", postId).eq("user_id", userId);
    if (error) throw error;
    return false;
  }
  const { error } = await supabase.from("bookmarks").insert({ post_id: postId, user_id: userId });
  if (error) throw error;
  return true;
}
