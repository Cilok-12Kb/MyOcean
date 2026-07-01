// src/pages/Public/MarinMinamo.jsx
import PublicNavbar from "../../components/PublicNavbar";
import useMarinMinamoChat from "../../hooks/useMarinMinamoChat";
import {
  ChatSidebar,
  ChatHeader,
  MessageList,
  ChatInputBar,
} from "../../components/marinMinamo";

export default function MarinMinamo() {
  const {
    messages,
    input,
    isTyping,
    messagesEndRef,
    textareaRef,
    handleInput,
    handleKeyDown,
    sendMessage,
  } = useMarinMinamoChat();

  const lastMessage = messages[messages.length - 1];

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
          <ChatSidebar lastMessageText={lastMessage?.text} />

          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            <ChatHeader />

            <MessageList ref={messagesEndRef} messages={messages} isTyping={isTyping} />

            <ChatInputBar
              input={input}
              onInputChange={handleInput}
              onKeyDown={handleKeyDown}
              onSend={sendMessage}
              isTyping={isTyping}
              textareaRef={textareaRef}
            />
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