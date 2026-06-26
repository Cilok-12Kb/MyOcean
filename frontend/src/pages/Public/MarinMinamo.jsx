import { useState, useRef, useEffect } from "react";
import PublicNavbar from "../../components/PublicNavbar";
import iconAi from "../../assets/images/icon_ai.jpg";

function formatTime() {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}
function formatDate() {
  return new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function BotAvatar({ size = 30 }) {
  return (
    <img
      src={iconAi}
      alt="Marin Minamo"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        flexShrink: 0,
        border: "2px solid #bae6fd",
      }}
    />
  );
}

export default function MarinMinamo() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Halo! Saya Marin Minamo, siap membantu Anda dengan informasi banjir rob, pasang surut laut, cuaca maritim, dan peringatan dini. Ada yang bisa saya bantu?",
      time: formatTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleInput = (e) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { id: Date.now(), type: "user", text, time: formatTime() }]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsTyping(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await response.json();
      setIsTyping(false);
      setMessages((prev) => [...prev, { id: Date.now() + 1, type: "bot", text: data.reply, time: formatTime() }]);
    } catch {
      setIsTyping(false);
      setMessages((prev) => [...prev, { id: Date.now() + 1, type: "bot", text: "Maaf, terjadi kesalahan. Silakan coba lagi.", time: formatTime() }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <PublicNavbar />

      <div style={{ background: "#f0f4f8", padding: "20px" }}>
      <div
        style={{
          display: "flex",
          height: "calc(100vh - 180px)",
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        {/* Sidebar */}
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
                {messages[messages.length - 1]?.text.slice(0, 28)}…
              </div>
            </div>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
          </div>
        </aside>

        {/* Main chat */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* Chat header */}
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

          {/* Messages */}
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
              <div key={msg.id} style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: msg.type === "user" ? "flex-end" : "flex-start",
                    alignItems: "flex-end",
                    gap: 10,
                  }}
                >
                  {msg.type === "bot" && <BotAvatar size={30} />}
                  <div
                    style={{
                      maxWidth: "65%",
                      padding: "10px 15px",
                      borderRadius: 18,
                      fontSize: 14,
                      lineHeight: 1.6,
                      ...(msg.type === "user"
                        ? { background: "#2563eb", color: "#fff", borderBottomRightRadius: 4 }
                        : { background: "#fff", color: "#1e293b", borderBottomLeftRadius: 4, border: "1px solid #e2e8f0" }),
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#94a3b8",
                    marginTop: 4,
                    textAlign: msg.type === "user" ? "right" : "left",
                    paddingLeft: msg.type === "bot" ? 40 : 0,
                  }}
                >
                  {msg.time}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
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
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
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
              onChange={handleInput}
              onKeyDown={handleKeyDown}
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
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: input.trim() && !isTyping ? "#2563eb" : "#e2e8f0",
                border: "none",
                cursor: input.trim() && !isTyping ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.15s",
              }}
              aria-label="Kirim pesan"
            >
              <i
                className="ti ti-send"
                style={{ fontSize: 16, color: input.trim() && !isTyping ? "#fff" : "#94a3b8" }}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
      </div>

      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-4px); }
        }
        @media (max-width: 640px) {
          .chat-sidebar { display: none !important; }
        }
      `}</style>
    </>
  );
}

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