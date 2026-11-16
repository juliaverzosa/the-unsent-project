import PostCard from "../components/post_card";
import { getThemeForPosition } from "../components/post_card";
import EmptyState from "../components/empty_state";

export default function Profile({ posts, likedPosts, user, profile, savedIds, likedIds, onEdit, onBookmark, onReact, onDelete, onReport }) {
  const mine = posts.filter(post => post.user_id === user?.id);
  const themedMine = themePosts(mine);
  const themedLiked = themePosts(likedPosts);
  return <section className="profile-page"><div className="profile-header"><span className="avatar large" style={{background: profile?.avatar_color || "#b97983"}}>{(profile?.username || "U").slice(0,1).toUpperCase()}</span><div><h1>{profile?.username || user?.email?.split("@")[0] || "Your profile"}</h1><p>{profile?.bio || "A little space that belongs to you."}</p><button className="secondary-btn" onClick={onEdit}>Edit profile</button></div></div>
    <div className="profile-section"><h2>Your posts <span>{mine.length}</span></h2><div className="posts-grid">{themedMine.length ? themedMine.map(post => <PostCard key={post.id} post={{...post, liked: likedIds.includes(post.id)}} user={user} saved={savedIds.includes(post.id)} onBookmark={onBookmark} onReact={onReact} onDelete={onDelete} onReport={onReport} onOpenDetail={() => {}}/>) : <EmptyState title="Nothing here yet." message="Your confessions will appear here."/>}</div></div>
    <div className="profile-section"><h2>Posts you liked <span>{likedPosts.length}</span></h2><div className="posts-grid">{themedLiked.length ? themedLiked.map(post => <PostCard key={post.id} post={{...post, liked: true}} user={user} saved={savedIds.includes(post.id)} onBookmark={onBookmark} onReact={onReact} onDelete={onDelete} onReport={onReport} onOpenDetail={() => {}}/>) : <EmptyState title="No liked posts yet." message="The words that find you will appear here."/>}</div></div>
  </section>;
}

function themePosts(posts) {
  let previousTheme;
  return posts.map((post, index) => {
    const theme_class = getThemeForPosition(post, index, previousTheme);
    previousTheme = theme_class;
    return { ...post, theme_class };
  });
}
