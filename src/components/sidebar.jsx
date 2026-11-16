import { House, Compass, Bookmark, UserRound } from "lucide-react";

const links = [
  ["home", "Home", House], ["discover", "Discover", Compass],
  ["memory-jar", "Memory jar", Bookmark], ["profile", "Profile", UserRound],
];

export default function Sidebar({ page, setPage }) {
  return <aside className="sidebar">
    <div className="brand"><span className="brand-mark">u.</span><div><strong>the unsent</strong><small>project</small></div></div>
    <p className="nav-caption">YOUR SPACE</p>
    <nav>{links.map(([id, label, Icon]) =>
      <button key={id} className={`nav-link ${page === id ? "active" : ""}`} onClick={() => setPage(id)}>
        <Icon size={18}/>{label}
      </button>)}</nav>
    <p className="sidebar-note">A quiet place for the words you never sent.</p>
  </aside>;
}
