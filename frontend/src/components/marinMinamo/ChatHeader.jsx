// src/components/marinMinamo/ChatHeader.jsx
import BotAvatar from "./BotAvatar";

export default function ChatHeader() {
  return (
    <div
      style={{
        padding: "12px 20px",
        background: "#fff",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexShrink: 0,
      }}
    >
      <BotAvatar size={42} />
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Marin Minamo</div>
        <div style={{ fontSize: 12, color: "#22c55e", display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
          Online
        </div>
      </div>
    </div>
  );
}