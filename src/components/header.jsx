import { useEffect, useRef, useState } from "react";
import { Plus, Bookmark, LogIn, UserRound, LogOut, UserRoundCog } from "lucide-react";

export default function Header({ onCreate, onNavigate, onAuth, onProfile, onSwitchGuest, onLogout, currentView, savedCount, profile, showMemoryJar }) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const closeMenu = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) setProfileMenuOpen(false);
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  return (
    <header className="navbar">
      <div className="brand" onClick={() => onNavigate("home")}>
        <img className="brand-logo" src="/theunsent_logo.png" alt="The Unsent Project" />
      </div>
      
      <div className="top-right-nav">
        {(showMemoryJar || profile) && (
          <button
            className={`nav-link ${currentView === "jar" ? "active" : ""}`}
            onClick={() => onNavigate(currentView === "jar" ? "home" : "jar")}
          >
            <Bookmark size={15} />
            <span className="nav-label">{currentView === "jar" ? "Unsent Wall" : "Memory Jar"}</span>
            {currentView !== "jar" && <span className="jar-badge">{savedCount}</span>}
          </button>
        )}
        <button className="write-btn" onClick={onCreate}>
          <Plus size={17}/> Write
        </button>
        {profile ? (
          <div className="profile-menu-wrap" ref={profileMenuRef}>
            <button
              className="profile-avatar-btn"
              onClick={() => setProfileMenuOpen((open) => !open)}
              aria-label="Open account menu"
              aria-expanded={profileMenuOpen}
              title="Your account"
              style={{
                backgroundColor: profile.avatar_color || "#5b3a88",
                borderColor: profile.avatar_color || "#5b3a88",
              }}
            >
              {profile.username?.slice(0, 1).toUpperCase() || <UserRound size={17} />}
            </button>
            {profileMenuOpen && (
              <div className="profile-menu">
                <button type="button" onClick={() => { setProfileMenuOpen(false); onProfile(); }}>
                  <UserRoundCog size={16} /> View profile
                </button>
                <button type="button" onClick={() => { setProfileMenuOpen(false); onSwitchGuest(); }}>
                  <UserRound size={16} /> Switch to guest
                </button>
                <button type="button" className="profile-menu-danger" onClick={() => { setProfileMenuOpen(false); onLogout(); }}>
                  <LogOut size={16} /> Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="quiet-entry-btn" onClick={onAuth} aria-label="Log in or sign up">
            <LogIn size={16} /> Enter the quiet
          </button>
        )}
      </div>
    </header>
  );
}