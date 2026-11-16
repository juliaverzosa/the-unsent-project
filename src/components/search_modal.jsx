import { ArrowUpRight, Search, X } from "lucide-react";

export default function SearchModal({ posts, search, setSearch, onClose, onOpenPost }) {
  const recommendations = posts.slice(0, 4);
  const results = search.trim()
    ? posts.filter((post) => {
        const query = search.toLowerCase();
        return post.content?.toLowerCase().includes(query) ||
          post.subtitle?.toLowerCase().includes(query) ||
          post.emotion?.toLowerCase().includes(query);
      })
    : recommendations;

  return (
    <div className="modal-backdrop search-modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="search-modal" role="dialog" aria-modal="true" aria-labelledby="search-title">
        <div className="search-modal-header">
          <div>
            <h2 id="search-title">Search the quiet</h2>
            <p>Find words that meet you where you are.</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close search">
            <X size={20} />
          </button>
        </div>

        <label className="search-modal-input">
          <Search size={20} />
          <input
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Try “letting go”, “mom”, or “hope”..."
            aria-label="Search posts"
          />
        </label>

        <p className="search-modal-label">{search.trim() ? "MATCHING WORDS" : "A FEW WORDS FOR RIGHT NOW"}</p>
        <div className="search-results">
          {results.length ? results.map((post) => (
            <button type="button" className="search-result" key={post.id} onClick={() => onOpenPost(post)}>
              <span className={`search-result-tag tag-${post.emotion?.toLowerCase() || "unspoken"}`}>
                {post.emotion || "Unspoken"}
              </span>
              <span className="search-result-text">&ldquo;{post.content}&rdquo;</span>
              <ArrowUpRight size={17} />
            </button>
          )) : (
            <p className="search-empty">No words found for “{search}”.</p>
          )}
        </div>
      </section>
    </div>
  );
}
