import PostCard from "../components/post_card";
import EmptyState from "../components/empty_state";

export default function Discover({ posts, user, savedIds, onBookmark, onReact, onDelete }) {
  return <section><div className="section-heading"><span className="eyebrow">FROM THE COMMUNITY</span><h1>Discover</h1><p>Words left here by people you may never meet.</p></div>
    {posts.length ? posts.map(post => <PostCard key={post.id} post={post} user={user} saved={savedIds.includes(post.id)} onBookmark={onBookmark} onReact={onReact} onDelete={onDelete}/>) : <EmptyState/>}</section>;
}
