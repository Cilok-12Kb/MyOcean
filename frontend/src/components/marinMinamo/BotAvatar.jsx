// src/components/marinMinamo/BotAvatar.jsx
import iconAi from "../../assets/images/icon_ai.jpg";

export default function BotAvatar({ size = 30 }) {
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