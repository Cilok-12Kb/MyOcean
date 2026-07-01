// src/components/dashboardAdmin/TideStatsRow.jsx
import s from "./dashboardStyles";

export default function TideStatsRow({ tideChartData, latestTide }) {
  const validPoints = tideChartData.filter((p) => p.tide_height_digital != null);

  return (
    <div style={s.tideStatsRow}>
      <div style={s.tideStat}>
        <span style={s.tideStatLabel}>Tertinggi hari ini</span>
        <span style={{ ...s.tideStatValue, color: "#d97706" }}>
          {tideChartData.length
            ? `${Math.round(Math.max(...tideChartData.map((p) => Number(p.tide_height_digital || 0))) * 100)} cm`
            : "-"}
        </span>
      </div>
      <div style={s.tideStatDivider} />
      <div style={s.tideStat}>
        <span style={s.tideStatLabel}>Terendah hari ini</span>
        <span style={{ ...s.tideStatValue, color: "#0284c7" }}>
          {validPoints.length
            ? `${Math.round(Math.min(...validPoints.map((p) => Number(p.tide_height_digital))) * 100)} cm`
            : "-"}
        </span>
      </div>
      <div style={s.tideStatDivider} />
      <div style={s.tideStat}>
        <span style={s.tideStatLabel}>Rata-rata</span>
        <span style={{ ...s.tideStatValue, color: "#475569" }}>
          {validPoints.length
            ? `${Math.round(
                (validPoints.reduce((sum, p) => sum + Number(p.tide_height_digital), 0) / validPoints.length) * 100
              )} cm`
            : "-"}
        </span>
      </div>
      <div style={s.tideStatDivider} />
      <div style={s.tideStat}>
        <span style={s.tideStatLabel}>Status terkini</span>
        <span style={{ ...s.tideStatValue, color: "#16a34a", display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
          {latestTide?.status || "-"}
        </span>
      </div>
    </div>
  );
}