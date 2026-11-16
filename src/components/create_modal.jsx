import { useState } from "react";
import { X } from "lucide-react";

export default function CreateModal({ onClose, onSubmit }) {
  const [content, setContent] = useState("");
  const [emotion, setEmotion] = useState("Love");
  const [subtitle, setSubtitle] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setBusy(true);
    try { 
      await onSubmit({ content: content.trim(), emotion, subtitle, anonymous }); 
      onClose(); 
    } finally { 
      setBusy(false); 
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <form className="modal-content" onSubmit={submit}>
        <div className="modal-header">
          <div>
            <span className="hero-eyebrow">COMPLETELY ANONYMOUS</span>
            <h2>What&apos;s on your heart?</h2>
          </div>
          <button type="button" className="close-btn" onClick={onClose}><X size={20}/></button>
        </div>
        <div className="form-group">
          <label>Write the words you&apos;ve been carrying.</label>
          <textarea 
            autoFocus 
            rows={4}
            maxLength={1200} 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            placeholder="Dear someone, ..." 
            required
          />
        </div>
        <div className="form-group">
          <label>Dedication (Optional)</label>
          <input 
            type="text" 
            placeholder="e.g., To the one who changed my route"
            value={subtitle}
            onChange={e => setSubtitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Category</label>
          <select value={emotion} onChange={e => setEmotion(e.target.value)}>
            <option value="Love">Love</option>
            <option value="Healing">Healing</option>
            <option value="Growth">Growth</option>
            <option value="Reflection">Reflection</option>
            <option value="Gratitude">Gratitude</option>
            <option value="Regret">Regret</option>
            <option value="Unspoken">Unspoken</option>
          </select>
        </div>
        <div className="modal-footer-row">
          {/* <label className="disclaimer-text" style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
            <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)}/> Post anonymously
          </label> */}
          <button type="submit" className="btn-primary" disabled={busy || !content.trim()}>
            {busy ? "Posting..." : "Let it go"}
          </button>
        </div>
      </form>
    </div>
  );
}