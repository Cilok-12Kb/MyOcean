// src/components/marinMinamo/MessageList.jsx
import { forwardRef } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { formatDate } from "../../utils/chatMessageHelpers";

const MessageList = forwardRef(function MessageList({ messages, isTyping }, scrollAnchorRef) {
  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px 20px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        background: "#f8fafc",
      }}
    >
      {/* Date separator */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
        <span style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap", padding: "2px 10px", background: "#e2e8f0", borderRadius: 20 }}>
          {formatDate()}
        </span>
        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
      </div>

      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {isTyping && <TypingIndicator />}

      <div ref={scrollAnchorRef} />
    </div>
  );
});

export default MessageList;