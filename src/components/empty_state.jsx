export default function EmptyState({ title = "It's quiet here.", message = "Be the first to leave a few words." }) {
  return (
    <div className="empty-state">
      <span className="empty-line">—</span>
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
}