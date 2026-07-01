// src/components/dashboardAdmin/RobMonitorCard.jsx
import s from "./dashboardStyles";

export default function RobMonitorCard({ robData, topRobArea, topRobLevel, onDetail }) {
  return (
    <div style={s.monCard}>
      <div style={s.monCardHeader}>
        <div style={{ ...s.cardIconBox, background: "#fef2f2" }}>
          <i className="ti ti-map-2" style={{ fontSize: 14, color: "#ef4444" }} />
        </div>
        <div>
          <div style={s.monCardTitle}>Potensi Rob</div>
          <div style={s.monCardSub}>Pemantauan pesisir</div>
        </div>
      </div>
      <div style={s.monItems}>
        <div style={s.monItemRow}>
          <span style={s.monItemLabel}>Wilayah dipantau</span>
          <span style={s.monItemValue}>{robData.length || "-"}</span>
        </div>
        <div style={s.monItemRow}>
          <span style={s.monItemLabel}>Area kritis</span>
          <span style={s.monItemValue}>{topRobArea ? topRobArea.nama_wilayah : "-"}</span>
        </div>
        <div style={s.monItemRow}>
          <span style={s.monItemLabel}>Potensi tertinggi</span>
          <span
            style={{
              ...s.monItemValue,
              color: topRobLevel === "Tinggi" ? "#dc2626" : "#0f172a",
            }}
          >
            {topRobArea ? `${topRobLevel} (${topRobArea.tinggi_rob} m)` : "-"}
          </span>
        </div>
      </div>
      <button style={{ ...s.detailBtn, borderColor: "#ef4444", color: "#ef4444" }} onClick={onDetail}>
        Detail Peta Rob <i className="ti ti-arrow-right" style={{ fontSize: 11 }} />
      </button>
    </div>
  );
}