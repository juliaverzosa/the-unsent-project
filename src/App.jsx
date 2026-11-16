import { useState, useEffect } from "react";
import Header from "./components/header";
import CreateModal from "./components/create_modal";
import PostCard from "./components/post_card";
import { getThemeClass, getThemeForPosition } from "./components/post_card";
import EmptyState from "./components/empty_state";
import SearchModal from "./components/search_modal";
import ProfileModal from "./components/profile_modal";
import Profile from "./pages/profile";
import InfoPage from "./pages/info";
import Login from "./pages/login";
import { useAuth } from "./hooks/use_auth.jsx";
import { Sparkles, Heart, Bookmark, X, Share2, Search, Clock } from "lucide-react";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import { getProfile, saveProfile } from "./services/profiles";
import "./App.css";

function getGuestHandle() {
  let handle = localStorage.getItem("unsent_guest_handle");
  if (!handle) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    handle = `anon${randomNum}`;
    localStorage.setItem("unsent_guest_handle", handle);
  }
  return handle;
}

function getStoredIdList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function isMissingSupabaseTable(error, table) {
  return error?.code === "PGRST205" ||
    error?.message?.includes(`public.${table}`);
}

function themeDisplayedPosts(posts) {
  let previousTheme;
  return posts.map((post, index) => {
    const theme_class = getThemeForPosition(post, index, previousTheme);
    previousTheme = theme_class;
    return { ...post, theme_class };
  });
}

export default function App() {
  const { user, isGuest, signInAsGuest, signOut } = useAuth();
  const [currentView, setCurrentView] = useState("home"); // "home" | "jar" | "profile" | "promise" | "care" | "privacy"
  const [activeTab, setActiveTab] = useState("For you");
  const [posts, setPosts] = useState([]);
  const [guestHandle] = useState(() => getGuestHandle());
  const [savedIds, setSavedIds] = useState(() => getStoredIdList("unsent_saved"));
  const [likedIds, setLikedIds] = useState(() => getStoredIdList("unsent_liked"));
  const [profile, setProfile] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [authPageOpen, setAuthPageOpen] = useState(false);
  const [authReturnView, setAuthReturnView] = useState("home");
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [loading, setLoading] = useState(true);
  const hasAccount = Boolean(user && !isGuest);
  const accountStorageKey = hasAccount ? user.id : "guest";
  const [storageOwner, setStorageOwner] = useState(accountStorageKey);

  useEffect(() => {
    queueMicrotask(() => { void fetchPosts(); });
  }, []);

  useEffect(() => {
    setStorageOwner(accountStorageKey);
    setSavedIds(getStoredIdList(`unsent_saved_${accountStorageKey}`));
    setLikedIds(getStoredIdList(`unsent_liked_${accountStorageKey}`));
  }, [accountStorageKey]);

  useEffect(() => {
    if (storageOwner !== accountStorageKey) return;
    localStorage.setItem(`unsent_saved_${accountStorageKey}`, JSON.stringify(savedIds));
  }, [savedIds, accountStorageKey, storageOwner]);

  useEffect(() => {
    if (storageOwner !== accountStorageKey) return;
    localStorage.setItem(`unsent_liked_${accountStorageKey}`, JSON.stringify(likedIds));
  }, [likedIds, accountStorageKey, storageOwner]);

  useEffect(() => {
    if (!hasAccount) return;

    const loadProfile = async () => {
      try {
        const data = await getProfile(user.id);
        const fallbackProfile = {
          id: user.id,
          username: user.email?.split("@")[0] || "Your profile",
          bio: "A little space that belongs to you.",
          avatar_color: "#5b3a88",
        };
        setProfile(data?.username === "Guest" ? { ...data, ...fallbackProfile } : data || fallbackProfile);
      } catch (err) {
        console.error("Error loading profile:", err.message);
      }
    };

    void loadProfile();
  }, [user, hasAccount]);

  useEffect(() => {
    if (!hasAccount || !isSupabaseConfigured) return;

    const loadLikedPosts = async () => {
      const { data, error } = await supabase
        .from("reactions")
        .select("post_id")
        .eq("user_id", user.id);

      if (error) {
        if (isMissingSupabaseTable(error, "reactions")) return;
        console.error("Error loading liked posts:", error.message);
        return;
      }
      setLikedIds(Array.isArray(data) ? data.map((reaction) => reaction.post_id) : []);
    };

    void loadLikedPosts();
  }, [user, hasAccount]);

  async function fetchPosts() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      let previousTheme;
      const themedPosts = (data || []).map((post, index) => {
        const theme_class = getThemeForPosition(post, index, previousTheme);
        previousTheme = theme_class;
        return { ...post, theme_class };
      });
      setPosts(themedPosts);
    } catch (err) {
      console.error("Error fetching posts:", err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async ({ content, emotion, subtitle, anonymous }) => {
    try {
      const displayHandle = anonymous ? guestHandle : guestHandle;

      const newPost = {
        content,
        emotion: emotion || "Love",
        subtitle: subtitle || "To someone unforgettable",
        is_anonymous: anonymous,
        user_id: hasAccount ? user.id : null,
        author_name: displayHandle,
        likes: 0
      };

      const { data, error } = await supabase
        .from("posts")
        .insert([newPost])
        .select();

      if (error) throw error;
      if (data && data[0]) {
        const theme_class = getThemeForPosition(data[0], 0, posts[0]?.theme_class);
        setPosts([{ ...data[0], theme_class }, ...posts]);
      }
    } catch (err) {
      console.error("Error creating post:", err.message);
      alert(`Failed to publish post: ${err.message}`);
    }
  };

  const requireAccount = () => {
    if (hasAccount) return true;
    setAuthReturnView("jar");
    setAuthPageOpen(true);
    return false;
  };

  const handleBookmark = (id) => {
    if (!requireAccount()) return;
    setSavedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id) => {
    if (!hasAccount) return;
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      setPosts((current) => current.filter((post) => post.id !== id));
      setSelectedPost(null);
    } catch (err) {
      console.error("Error deleting post:", err.message);
      alert(`Could not delete post: ${err.message}`);
    }
  };

  const handleReport = () => {
    alert("Thanks for helping keep this space gentle. Your report has been noted.");
  };

  const handleNavigate = (view) => {
    if (view === "jar" && !requireAccount()) return;
    setCurrentView(view);
  };

  const handleReact = async (id) => {
    if (!hasAccount && !requireAccount()) return;
    const post = posts.find(p => p.id === id);
    if (!post) return;

    const liked = likedIds.includes(id);
    const newLikes = Math.max(0, (post.likes || 0) + (liked ? -1 : 1));
    const updatedPost = { ...post, likes: newLikes, liked: !liked };
    setPosts(posts.map(p => p.id === id ? updatedPost : p));
    setSelectedPost(current => current?.id === id ? updatedPost : current);
    setLikedIds((current) => liked ? current.filter((postId) => postId !== id) : [...current, id]);

    try {
      if (isSupabaseConfigured) {
        const reactionQuery = supabase
          .from("reactions")
          .eq("post_id", id)
          .eq("user_id", user.id);
        const { data: existing, error: lookupError } = await reactionQuery
          .select("id")
          .maybeSingle();

        if (!lookupError) {
          if (existing) {
            const { error } = await supabase.from("reactions").delete().eq("id", existing.id);
            if (error) throw error;
          } else {
            const { error } = await supabase.from("reactions").insert({
              post_id: id,
              user_id: user.id,
              reaction_type: "heart",
            });
            if (error) throw error;
          }
        } else if (!isMissingSupabaseTable(lookupError, "reactions")) {
          throw lookupError;
        }
      }

      const { error } = await supabase
        .from("posts")
        .update({ likes: newLikes })
        .eq("id", id);

      if (error) throw error;
    } catch (err) {
      console.error("Error updating likes:", err.message);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesTab = activeTab === "For you" || activeTab === "Recent" || post.emotion?.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = post.content.toLowerCase().includes(search.toLowerCase()) ||
                          (post.subtitle && post.subtitle.toLowerCase().includes(search.toLowerCase()));
    if (activeTab === "Recent") return matchesSearch;
    return matchesTab && matchesSearch;
  });

  const savedPosts = posts.filter(p => savedIds.includes(p.id));
  const likedPosts = posts.filter(p => likedIds.includes(p.id));
  const visiblePosts = showAllPosts ? filteredPosts : filteredPosts.slice(0, 6);
  const displayedPosts = themeDisplayedPosts(visiblePosts);
  const displayedSavedPosts = themeDisplayedPosts(savedPosts);
  const sharedPostCount = posts.length;

  if (authPageOpen) {
    return (
      <Login
        onAuthenticated={() => {
          setAuthPageOpen(false);
          setCurrentView(authReturnView);
        }}
        onGuestContinue={() => setAuthPageOpen(false)}
      />
    );
  }

  return (
    <div className="app-container">
      <Header 
        onCreate={() => setIsModalOpen(true)} 
        onNavigate={handleNavigate}
        onAuth={() => {
          setAuthReturnView(currentView);
          setAuthPageOpen(true);
        }}
        onProfile={() => setCurrentView("profile")}
        onSwitchGuest={async () => {
          try {
            await signOut();
            await signInAsGuest();
            setCurrentView("home");
          } catch (err) {
            console.error("Error switching to guest:", err.message);
            alert(`Could not switch to guest: ${err.message}`);
          }
        }}
        onLogout={async () => {
          try {
            await signOut();
            setCurrentView("home");
          } catch (err) {
            console.error("Error logging out:", err.message);
            alert(`Could not log out: ${err.message}`);
          }
        }}
        currentView={currentView}
        savedCount={savedPosts.length}
        showMemoryJar={hasAccount}
        profile={hasAccount ? profile || { username: user?.email?.split("@")[0] || "U" } : null}
      />

      {currentView === "home" && (
        <>
          <section className="hero-section">
            <div className="hero-left">
              {/* <span className="hero-eyebrow">
                <Sparkles size={13} /> A PLACE FOR UNSPOKEN THINGS
              </span> */}
              <h1 className="hero-title">
                Some words are<br /><i>meant to be felt.</i>
              </h1>
              <p className="hero-subtitle">
                Share what you never got to say. No names, no judgment—just honesty, quietly finding its way to someone who needs it.
              </p>
              <div className="hero-actions">
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                  Share anonymously 
                </button>
                <a href="#feed" className="btn-secondary">
                  Read their stories ↓
                </a>
              </div>
            </div>

            <div className="hero-card-preview">
              <div className="paper-note">
                <div className="note-tape"></div>
                <span className="note-label">A GENTLE REMINDER</span>
                <p className="note-quote">
                  &ldquo;What you feel is real, even when you cannot find the words for it yet.&rdquo;
                </p>
                <div className="note-footer">
                  <span>Take your time</span>
                  <Heart size={16} className="text-rose" />
                </div>
              </div>
            </div>
          </section>

          <section id="feed" className="feed-section">
            <div className="feed-header">
              <div>
                <h2>Messages in the quiet</h2>
              </div>
              <div className="live-counter">
                <span className="pulse-dot"></span> {sharedPostCount.toLocaleString()} unsaid shared
              </div>
            </div>

            <div className="filter-tabs">
              {["For you", "Recent", "Love", "Healing", "Growth", "Reflection", "Gratitude", "Regret"].map(tab => (
                <button 
                  key={tab} 
                  className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}

              <button type="button" className="search-pill-wrapper" onClick={() => setIsSearchOpen(true)}>
                <span>{search || "Find a feeling"}</span>
                <Search size={15} className="search-icon-pill" />
              </button>
            </div>

            <div className="posts-grid">
              {loading ? (
                <EmptyState title="Loading whispers..." message="Connecting to your Supabase database." />
              ) : filteredPosts.length === 0 ? (
                <EmptyState title="It's quiet here." message="Be the first to share your unspoken words." />
              ) : (
                displayedPosts.map((post, index) => (
                  <PostCard 
                    key={post.id} 
                    post={{ ...post, liked: likedIds.includes(post.id) }} 
                    user={user}
                    index={index}
                    saved={savedIds.includes(post.id)} 
                    onBookmark={handleBookmark} 
                    onReact={handleReact} 
                    onDelete={handleDelete}
                    onReport={handleReport}
                    onOpenDetail={() => setSelectedPost(post)}
                  />
                ))
              )}
            </div>
            {!loading && filteredPosts.length > 6 && (
              <button className="show-more-btn" onClick={() => setShowAllPosts((current) => !current)}>
                {showAllPosts ? "Show less" : "See more"}
              </button>
            )}
          </section>
        </>
      )}

      {currentView === "jar" && (
        <div className="memory-jar-container">
          <div className="jar-banner">
            <div className="jar-icon-illustration">
              <img src="/memory_jar.png" alt="Memory jar" />
            </div>
            <div className="jar-banner-text">
              <span className="hero-eyebrow">KEEP THE WORDS THAT FIND YOU</span>
              <h1>Your <i>Memory Jar</i></h1>
              <p>Save messages that make you pause, breathe, or feel a little less alone. Come back to them whenever you need.</p>
            </div>
          </div>

          <div className="feed-section" style={{ paddingTop: "40px" }}>
            <h2>Saved Confessions ({savedPosts.length})</h2>
            <div className="posts-grid" style={{ marginTop: "24px" }}>
              {savedPosts.length === 0 ? (
                <EmptyState title="Your Memory Jar is empty." message="Click the bookmark icon on any message to save it here." />
              ) : (
                displayedSavedPosts.map((post, index) => (
                  <PostCard 
                    key={post.id} 
                    post={{ ...post, liked: likedIds.includes(post.id) }}
                    user={user}
                    index={index}
                    saved={true} 
                    onBookmark={handleBookmark} 
                    onReact={handleReact} 
                    onDelete={handleDelete}
                    onReport={handleReport}
                    onOpenDetail={() => setSelectedPost(post)}
                  />
                ))
              )}

            </div>
          </div>
        </div>
      )}

      {currentView === "profile" && hasAccount && (
        <Profile
          posts={posts}
          likedPosts={likedPosts}
          user={user}
          profile={profile}
          savedIds={savedIds}
          likedIds={likedIds}
          onEdit={() => setIsProfileModalOpen(true)}
          onBookmark={handleBookmark}
          onReact={handleReact}
          onDelete={handleDelete}
          onReport={handleReport}
        />
      )}

      {["promise", "care", "privacy"].includes(currentView) && (
        <InfoPage type={currentView} onBack={() => setCurrentView("home")} />
      )}

      {isModalOpen && (
        <CreateModal 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleCreate} 
        />
      )}

      {isProfileModalOpen && (
        <ProfileModal
          profile={profile}
          onClose={() => setIsProfileModalOpen(false)}
          onSave={async (updates) => {
            try {
              const updatedProfile = await saveProfile(user.id, updates);
              setProfile(updatedProfile);
            } catch (err) {
              console.error("Error saving profile:", err.message);
              throw err;
            }
          }}
        />
      )}

      {isSearchOpen && (
        <SearchModal
          posts={posts}
          search={search}
          setSearch={setSearch}
          onClose={() => setIsSearchOpen(false)}
          onOpenPost={(post) => {
            setIsSearchOpen(false);
            setSelectedPost(post);
          }}
        />
      )}

      {selectedPost && (
        <div className="modal-backdrop" onClick={() => setSelectedPost(null)}>
          <div className={`detail-modal-content ${getThemeClass(selectedPost)}`} onClick={e => e.stopPropagation()}>
            <div className="detail-modal-header">
              <span className="category-pill">{selectedPost.emotion?.toUpperCase() || "UNSPOKEN"}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <span className="timestamp"><Clock size={13} /> {selectedPost.created_at ? new Date(selectedPost.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}</span>
                <button className="close-btn" onClick={() => setSelectedPost(null)}><X size={20} /></button>
              </div>
            </div>

            <p className="detail-quote">&ldquo;{selectedPost.content}&rdquo;</p>
            <span className="detail-subtitle">{selectedPost.subtitle || "To someone unforgettable"}</span>

            <div className="detail-divider"></div>

            <div className="detail-footer-actions">
              <button 
                className={`action-btn pill-action ${selectedPost.liked ? "liked" : ""}`}
                onClick={() => handleReact(selectedPost.id)}
              >
                <Heart size={16} fill={selectedPost.liked ? "currentColor" : "none"} /> 
                <span>This found me</span>
              </button>
              <button 
                className={`action-btn pill-action ${savedIds.includes(selectedPost.id) ? "saved" : ""}`}
                onClick={() => handleBookmark(selectedPost.id)}
              >
                <Bookmark size={16} fill={savedIds.includes(selectedPost.id) ? "currentColor" : "none"} /> 
                <span>Keep this</span>
              </button>
              <button className="action-btn pill-action" onClick={() => {
                navigator.clipboard.writeText(selectedPost.content);
                alert("Copied to clipboard!");
              }}>
                <Share2 size={16} /> 
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="footer-brand">
          <img className="footer-logo" src="/theunsent_logo.png" alt="The Unsent Project" />
        </div>
        <p>You are not alone in what you feel.</p>
        <div className="footer-links">
          <button type="button" onClick={() => setCurrentView("promise")}>Our promise</button>
          <button type="button" onClick={() => setCurrentView("care")}>Community care</button>
          <button type="button" onClick={() => setCurrentView("privacy")}>Privacy</button>
        </div>
      </footer>
    </div>
  );
}