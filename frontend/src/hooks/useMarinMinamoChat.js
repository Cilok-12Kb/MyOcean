// src/hooks/useMarinMinamoChat.js
import { useEffect, useRef, useState } from "react";
import { formatTime } from "../utils/chatMessageHelpers";

const CHAT_ENDPOINT = "http://127.0.0.1:8000/api/chat";

export default function useMarinMinamoChat() {
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
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ message: text }),
      });

      // Body error dari backend (500, 422, dll) tidak selalu JSON yang valid
      // (bisa halaman error HTML), jadi parsing-nya dibungkus try/catch sendiri
      // supaya tidak ikut jatuh ke catch luar dan kehilangan info status.
      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      setIsTyping(false);

      // Kalau request gagal (response.ok === false) atau backend tidak
      // mengirim field "reply", JANGAN pakai data.reply mentah — itu bikin
      // text jadi undefined dan bisa meledak di komponen yang baca .text.
      const botText =
        response.ok && data.reply
          ? data.reply
          : data.message || "Maaf, Marin lagi ada gangguan menjawab pertanyaan kamu. Coba lagi sebentar ya~";

      setMessages((prev) => [...prev, { id: Date.now() + 1, type: "bot", text: botText, time: formatTime() }]);
    } catch {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, type: "bot", text: "Maaf, terjadi kesalahan. Silakan coba lagi.", time: formatTime() },
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return {
    messages,
    input,
    isTyping,
    messagesEndRef,
    textareaRef,
    handleInput,
    handleKeyDown,
    sendMessage,
  };
}