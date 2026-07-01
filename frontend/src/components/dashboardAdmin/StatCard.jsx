// src/components/dashboardAdmin/StatCard.jsx
import s from "./dashboardStyles";

export default function StatCard({ label, value, sub, accent, accentBg, icon }) {
  return (
    <div style={{ ...s.statCard, borderTop: `3px solid ${accent}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={s.statLabel}>{label}</span>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: accentBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <i className={`ti ${icon}`} style={{ fontSize: 16, color: accent }} />
        </div>
      </div>
      <div style={s.statVal}>{value}</div>
      <div style={{ fontSize: 11, color: accent, marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
        {sub}
      </div>
    </div>
  );
}