import { useState } from "react";
import { X } from "lucide-react";

const AVATAR_COLORS = ["#5b3a88", "#b97983", "#7d91b5", "#5f8f82", "#c8875b", "#9a789d"];

export default function ProfileModal({ profile, onClose, onSave }) {
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatarColor, setAvatarColor] = useState(profile?.avatar_color || "#b97983");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave({ username: username.trim(), bio: bio.trim(), avatar_color: avatarColor });
      onClose();
    } catch (err) {
      setError(err.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <form className="modal profile-form" onSubmit={handleSubmit}>
      <div className="modal-heading">
        <div>
          <span className="profile-form-eyebrow">YOUR CORNER</span>
          <h2>Edit profile</h2>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X/></button>
      </div>
      <p className="profile-form-note">Choose how you want to be known in this quiet place.</p>
      {error && <p className="profile-form-error">{error}</p>}
      <label>Username<input required maxLength={24} value={username} onChange={e => setUsername(e.target.value)} placeholder="Your quiet name" /></label>
      <label>Bio<textarea maxLength={160} rows={4} value={bio} onChange={e => setBio(e.target.value)} placeholder="A few words about you..." /></label>
      <div className="profile-color-row">
        <label>Avatar color</label>
        <div className="avatar-color-picker">
          <div className="avatar-color-swatches">
            {AVATAR_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`avatar-color-swatch ${avatarColor === color ? "selected" : ""}`}
                style={{ backgroundColor: color }}
                onClick={() => setAvatarColor(color)}
                aria-label={`Choose ${color}`}
                aria-pressed={avatarColor === color}
              />
            ))}
          </div>
          <label className="custom-color-option" htmlFor="avatar-color">
            <input id="avatar-color" type="color" value={avatarColor} onChange={e => setAvatarColor(e.target.value)} />
            <span>Custom</span>
          </label>
        </div>
      </div>
      <button className="primary-btn submit-btn" type="submit" disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
    </form>
  </div>;
}
