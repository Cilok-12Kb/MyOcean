// src/components/marinMinamo/MessageBubble.jsx
import BotAvatar from "./BotAvatar";
import ChatMessageContent from "./ChatMessageContent";

export default function MessageBubble({ message }) {
  const isUser = message.type === "user";

  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: isUser ? "flex-end" : "flex-start",
          alignItems: "flex-end",
          gap: 10,
        }}
      >
        {!isUser && <BotAvatar size={30} />}
        <div
          style={{
            maxWidth: isUser ? "65%" : "85%",
            padding: "10px 15px",
            borderRadius: 18,
            fontSize: 14,
            lineHeight: 1.6,
            ...(isUser
              ? { background: "#2563eb", color: "#fff", borderBottomRightRadius: 4 }
              : { background: "#fff", color: "#1e293b", borderBottomLeftRadius: 4, border: "1px solid #e2e8f0" }),
          }}
        >
          {isUser ? message.text : <ChatMessageContent text={message.text} />}
        </div>
      </div>
      <div
        style={{
          fontSize: 11,
          color: "#94a3b8",
          marginTop: 4,
          textAlign: isUser ? "right" : "left",
          paddingLeft: isUser ? 0 : 40,
        }}
      >
        {message.time}
      </div>
    </div>
  );
}