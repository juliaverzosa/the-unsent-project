import PostCard from "../components/post_card";
import EmptyState from "../components/empty_state";

export default function Home({ posts, user, savedIds, onBookmark, onReact, onDelete }) {
  return <section><div className="page-intro"><span className="eyebrow">A PLACE TO LET GO</span><h1>The things we<br/><em>never said.</em></h1><p>Some words deserve somewhere to land.</p></div>
    <div className="feed">{posts.length ? posts.map(post => <PostCard key={post.id} post={post} user={user} saved={savedIds.includes(post.id)} onBookmark={onBookmark} onReact={onReact} onDelete={onDelete}/>) : <EmptyState/>}</div>
  </section>;
}
