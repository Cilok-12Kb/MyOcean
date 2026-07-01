// src/components/marinMinamo/TypingIndicator.jsx
import BotAvatar from "./BotAvatar";

export default function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 12 }}>
      <BotAvatar size={30} />
      <div
        style={{
          padding: "12px 16px",
          background: "#fff",
          borderRadius: 18,
          borderBottomLeftRadius: 4,
          border: "1px solid #e2e8f0",
          display: "flex",
          gap: 5,
          alignItems: "center",
        }}
      >
        {[0, 0.2, 0.4].map((delay, i) => (
          <span
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#94a3b8",
              animation: `typingDot 1.2s ${delay}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}