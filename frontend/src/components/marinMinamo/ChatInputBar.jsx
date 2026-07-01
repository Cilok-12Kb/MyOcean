// src/components/marinMinamo/ChatInputBar.jsx

const iconBtnStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 6,
};

export default function ChatInputBar({ input, onInputChange, onKeyDown, onSend, isTyping, textareaRef }) {
  const canSend = Boolean(input.trim()) && !isTyping;

  return (
    <div
      style={{
        padding: "10px 16px",
        background: "#fff",
        borderTop: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "flex-end",
        gap: 10,
      }}
    >
      <button style={iconBtnStyle} aria-label="Lampirkan file">
        <i className="ti ti-paperclip" style={{ fontSize: 20, color: "#94a3b8" }} aria-hidden="true" />
      </button>

      <textarea
        ref={textareaRef}
        rows={1}
        value={input}
        onChange={onInputChange}
        onKeyDown={onKeyDown}
        placeholder="Tulis pesan…"
        style={{
          flex: 1,
          resize: "none",
          border: "1px solid #e2e8f0",
          borderRadius: 22,
          padding: "9px 16px",
          fontSize: 14,
          lineHeight: 1.5,
          outline: "none",
          maxHeight: 120,
          minHeight: 40,
          background: "#f8fafc",
          fontFamily: "inherit",
          color: "#1e293b",
        }}
      />

      <button
        onClick={onSend}
        disabled={!canSend}
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: canSend ? "#2563eb" : "#e2e8f0",
          border: "none",
          cursor: canSend ? "pointer" : "default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "background 0.15s",
        }}
        aria-label="Kirim pesan"
      >
        <i className="ti ti-send" style={{ fontSize: 16, color: canSend ? "#fff" : "#94a3b8" }} aria-hidden="true" />
      </button>
    </div>
  );
}