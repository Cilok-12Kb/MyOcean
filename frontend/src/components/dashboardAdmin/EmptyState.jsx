// src/components/dashboardAdmin/EmptyState.jsx
import s from "./dashboardStyles";

export default function EmptyState({ text }) {
  return (
    <div style={s.emptyState}>
      <i className="ti ti-info-circle" style={{ fontSize: 28, color: "#94a3b8" }} />
      <p style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>{text}</p>
    </div>
  );
}