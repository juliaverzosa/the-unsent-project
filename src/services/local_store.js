const POSTS_KEY = "unsent-demo-posts";
const BOOKMARKS_KEY = "unsent-demo-bookmarks";
const PROFILE_KEY = "unsent-demo-profile";

const starterPosts = [
  {
    id: "demo-1",
    user_id: "someone",
    content: "I hope you are finding small reasons to stay soft.",
    emotion: "Healing",
    is_anonymous: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    profiles: { username: "A quiet stranger", avatar_color: "#b97983" },
  },
  {
    id: "demo-2",
    user_id: "someone-else",
    content: "Some goodbyes take a while to become something we can carry.",
    emotion: "Goodbye",
    is_anonymous: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    profiles: { username: "A quiet stranger", avatar_color: "#7d91b5" },
  },
];

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getLocalPosts() {
  return read(POSTS_KEY, starterPosts);
}

export function saveLocalPosts(posts) {
  write(POSTS_KEY, posts);
}

export function getLocalBookmarks() {
  return read(BOOKMARKS_KEY, []);
}

export function saveLocalBookmarks(bookmarks) {
  write(BOOKMARKS_KEY, bookmarks);
}

export function getLocalProfile(userId = "default") {
  const key = userId === "default" ? PROFILE_KEY : `${PROFILE_KEY}-${userId}`;
  return read(key, {
    id: "guest-local",
    username: "Guest",
    bio: "A little space that belongs to you.",
    avatar_color: "#c85f52",
  });
}

export function saveLocalProfile(profile) {
  const key = profile.id && profile.id !== "guest-local"
    ? `${PROFILE_KEY}-${profile.id}`
    : PROFILE_KEY;
  write(key, profile);
  return profile;
}
