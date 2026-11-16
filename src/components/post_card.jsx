import { useEffect, useRef, useState } from "react";
import { Bookmark, Heart, Share2, MoreHorizontal, Trash2, Flag } from "lucide-react";

// Rotates pastel card color themes matching your reference design
export const THEMES = [
  "card-lavender", // Soft purple
  "card-peach",    // Soft peach
  "card-mint",     // Soft green
  "card-rose",     // Soft pink
  "card-blue",     // Soft blue
  "card-cream"     // Soft yellow/cream
];

export function getThemeClass(post, index = 0) {
  if (post?.theme_class) return post.theme_class;
  const key = String(post?.id || index);
  const hash = [...key].reduce((total, character) => total + character.charCodeAt(0), 0);
  return THEMES[hash % THEMES.length];
}

export function getThemeForPosition(post, index, previousTheme) {
  const availableThemes = THEMES.filter((theme) => theme !== previousTheme);
  const key = String(post?.id || index);
  const hash = [...key].reduce((total, character) => total + character.charCodeAt(0), 0);
  return availableThemes[hash % availableThemes.length];
}

export default function PostCard({ post, user, index, onBookmark, onReact, onOpenDetail, onDelete, onReport, saved }) {
  const themeClass = getThemeClass(post, index);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const isMine = Boolean(user?.id && post.user_id === user.id);

  useEffect(() => {
    const closeMenu = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  return (
    <article className={`confession-card ${themeClass}`} onClick={onOpenDetail}>
      <div className="card-top">
        <span className="category-pill">{post.emotion?.toUpperCase() || "UNSPOKEN"}</span>
        <div className="card-top-right">
          <span className="timestamp">{post.created_at ? "Recent" : "Just now"}</span>
          <div className="post-menu-wrap" ref={menuRef}>
            <button className="icon-more-btn" onClick={(e) => { e.stopPropagation(); setMenuOpen((open) => !open); }} aria-label="Post options" aria-expanded={menuOpen}>
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <div className="post-menu">
                {isMine ? (
                  <button type="button" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete?.(post.id); }}>
                    <Trash2 size={14} /> Delete
                  </button>
                ) : (
                  <button type="button" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onReport?.(post); }}>
                    <Flag size={14} /> Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card-body">
        <p className="confession-text">&ldquo;{post.content}&rdquo;</p>
        <span className="confession-subtitle">{post.subtitle || "To someone unforgettable"}</span>
      </div>

      <div className="card-footer" onClick={(e) => e.stopPropagation()}>
        <button 
          className={`action-btn ${post.liked ? "liked" : ""}`} 
          onClick={() => onReact(post.id)}
        >
          <Heart size={16} fill={post.liked ? "currentColor" : "none"}/> <span>{post.likes || 0}</span>
        </button>

        <div className="card-footer-right">
          <button className="action-btn" onClick={() => {
            navigator.clipboard.writeText(post.content);
            alert("Copied to clipboard!");
          }} title="Share">
            <Share2 size={16} />
          </button>
          <button 
            className={`action-btn ${saved ? "saved" : ""}`} 
            onClick={() => onBookmark(post.id)} 
            title="Save to Memory Jar"
          >
            <Bookmark size={16} fill={saved ? "currentColor" : "none"}/>
          </button>
        </div>
      </div>
    </article>
  );
}