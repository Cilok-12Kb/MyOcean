// src/components/dashboardAdmin/WeatherMonitorCard.jsx
import s from "./dashboardStyles";

export default function WeatherMonitorCard({ weatherData, avgTemp, dominantWeather, onDetail }) {
  return (
    <div style={s.monCard}>
      <div style={s.monCardHeader}>
        <div style={{ ...s.cardIconBox, background: "#e0f2fe" }}>
          <i className="ti ti-cloud" style={{ fontSize: 14, color: "#0284c7" }} />
        </div>
        <div>
          <div style={s.monCardTitle}>Cuaca Semarang</div>
          <div style={s.monCardSub}>Integrasi BMKG</div>
        </div>
      </div>
      <div style={s.monItems}>
        <div style={s.monItemRow}>
          <span style={s.monItemLabel}>Kelurahan terpantau</span>
          <span style={s.monItemValue}>{weatherData.length || "-"}</span>
        </div>
        <div style={s.monItemRow}>
          <span style={s.monItemLabel}>Suhu rata-rata</span>
          <span style={s.monItemValue}>{avgTemp != null ? `${avgTemp}°C` : "-"}</span>
        </div>
        <div style={s.monItemRow}>
          <span style={s.monItemLabel}>Cuaca dominan</span>
          <span style={s.monItemValue}>{dominantWeather}</span>
        </div>
      </div>
      <button style={{ ...s.detailBtn, borderColor: "#0284c7", color: "#0284c7" }} onClick={onDetail}>
        Detail Cuaca <i className="ti ti-arrow-right" style={{ fontSize: 11 }} />
      </button>
    </div>
  );
}