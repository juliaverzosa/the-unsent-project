import { ArrowLeft, Heart, ShieldCheck, Sparkles } from "lucide-react";

const CONTENT = {
  promise: {
    eyebrow: "OUR PROMISE",
    title: "A softer place to be honest.",
    intro: "The Unsent Project is built for the words that feel too heavy, too tender, or too late to send.",
    icon: Heart,
    sections: [
      ["Your words belong to you.", "Share only what feels right. You can remain anonymous, and you can ask for your own posts to be removed."],
      ["No judgment lives here.", "Every feeling is allowed to exist without needing to be explained, defended, or made smaller."],
      ["We choose gentleness.", "We design this space to encourage reflection, empathy, and honest connection."],
    ],
  },
  care: {
    eyebrow: "COMMUNITY CARE",
    title: "Leave the room kinder.",
    intro: "A quiet community works when everyone helps protect its softness.",
    icon: Sparkles,
    sections: [
      ["Share from your own experience.", "Speak honestly, but avoid sharing private details about another person without their consent."],
      ["Make space for different feelings.", "Disagreement is possible without cruelty. Choose words that do not intentionally harm or target others."],
      ["Report what feels unsafe.", "Use the report option on a post that breaks these expectations. We will continue improving how this space is cared for."],
    ],
  },
  privacy: {
    eyebrow: "PRIVACY",
    title: "Your quiet is yours.",
    intro: "We keep the information needed to let The Unsent Project work and avoid asking for more than that.",
    icon: ShieldCheck,
    sections: [
      ["Accounts.", "Your email is used for authentication. Your username and bio are shown on your profile when you choose to add them."],
      ["Posts and reactions.", "Posts, likes, and saved messages are connected to your account so your profile and Memory Jar can work."],
      ["You stay in control.", "Do not share anything sensitive that you would not want stored. Contact the project owner if you need help removing account data."],
    ],
  },
};

export default function InfoPage({ type, onBack }) {
  const content = CONTENT[type];
  const Icon = content.icon;

  return (
    <main className="info-page">
      <button className="info-back-btn" type="button" onClick={onBack}>
        <ArrowLeft size={16} /> Back to the wall
      </button>
      <div className="info-heading">
        <span className="hero-eyebrow"><Icon size={14} /> {content.eyebrow}</span>
        <h1>{content.title}</h1>
        <p>{content.intro}</p>
      </div>
      <div className="info-sections">
        {content.sections.map(([title, text]) => (
          <section key={title} className="info-section">
            <h2>{title}</h2>
            <p>{text}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
