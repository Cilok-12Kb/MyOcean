// src/components/marinMinamo/ChatSidebar.jsx
import BotAvatar from "./BotAvatar";

export default function ChatSidebar({ lastMessageText }) {
  return (
    <aside
      className="chat-sidebar"
      style={{
        width: 260,
        background: "#fff",
        borderRight: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* Label */}
      <div style={{ padding: "16px 16px 10px", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
        <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".8px", fontWeight: 600, margin: 0 }}>
          Asisten
        </p>
      </div>

      {/* Bot list item */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          background: "#eff6ff",
          borderLeft: "3px solid #2563eb",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <BotAvatar size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>Marin Minamo</div>
          <div style={{ fontSize: 11, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {lastMessageText?.slice(0, 28) ?? ""}…
          </div>
        </div>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
      </div>
    </aside>
  );
}