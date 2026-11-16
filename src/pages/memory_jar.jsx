import PostCard from "../components/post_card";
import EmptyState from "../components/empty_state";

export default function MemoryJar({ posts, user, savedIds, onBookmark, onReact, onDelete }) {
  const saved = posts.filter(post => savedIds.includes(post.id));
  return <section><div className="section-heading"><span className="eyebrow">KEPT CLOSE</span><h1>Memory jar</h1><p>The words you wanted to keep.</p></div>
    {saved.length ? saved.map(post => <PostCard key={post.id} post={post} user={user} saved onBookmark={onBookmark} onReact={onReact} onDelete={onDelete}/>) : <EmptyState title="Your jar is empty." message="Save a confession to find it here later."/>}</section>;
}
