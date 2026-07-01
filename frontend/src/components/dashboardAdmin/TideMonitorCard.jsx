// src/components/dashboardAdmin/TideMonitorCard.jsx
import s from "./dashboardStyles";

export default function TideMonitorCard({ latestTide, onDetail }) {
  return (
    <div style={s.monCard}>
      <div style={s.monCardHeader}>
        <div style={{ ...s.cardIconBox, background: "#fffbeb" }}>
          <i className="ti ti-chart-line" style={{ fontSize: 14, color: "#f59e0b" }} />
        </div>
        <div>
          <div style={s.monCardTitle}>Pasang Surut</div>
          <div style={s.monCardSub}>Data real-time</div>
        </div>
      </div>
      <div style={s.monItems}>
        <div style={s.monItemRow}>
          <span style={s.monItemLabel}>Jam terakhir</span>
          <span style={s.monItemValue}>
            {latestTide ? `${String(latestTide.jam).padStart(2, "0")}:00` : "-"}
          </span>
        </div>
        <div style={s.monItemRow}>
          <span style={s.monItemLabel}>Tinggi air terkini</span>
          <span style={s.monItemValue}>
            {latestTide ? `${(latestTide.tide_height_digital * 100).toFixed(0)} cm` : "-"}
          </span>
        </div>
        <div style={s.monItemRow}>
          <span style={s.monItemLabel}>Status</span>
          <span style={s.monItemValue}>
            {latestTide?.status ? (
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#16a34a",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                {latestTide.status}
              </span>
            ) : (
              "-"
            )}
          </span>
        </div>
      </div>
      <button style={{ ...s.detailBtn, borderColor: "#f59e0b", color: "#f59e0b" }} onClick={onDetail}>
        Detail Pasang Surut <i className="ti ti-arrow-right" style={{ fontSize: 11 }} />
      </button>
    </div>
  );
}