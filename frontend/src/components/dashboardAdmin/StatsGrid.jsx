// src/components/dashboardAdmin/StatsGrid.jsx
import StatCard from "./StatCard";
import s from "./dashboardStyles";

export default function StatsGrid({ robData, highCount, maxRob, avgTemp, weatherData }) {
  return (
    <div style={s.statsGrid}>
      <StatCard
        label="Lokasi Dipantau"
        value={robData.length || "-"}
        sub={`${robData.length} titik wilayah pesisir`}
        accent="#0284c7"
        accentBg="#e0f2fe"
        icon="ti-map-pin"
      />
      <StatCard
        label="Siaga Tinggi"
        value={highCount || 0}
        sub={highCount > 0 ? "area berpotensi rob tinggi" : "tidak ada siaga tinggi"}
        accent={highCount > 0 ? "#ef4444" : "#16a34a"}
        accentBg={highCount > 0 ? "#fef2f2" : "#f0fdf4"}
        icon="ti-alert-triangle"
      />
      <StatCard
        label="Tinggi Rob Maks"
        value={`${maxRob.toFixed(2)} m`}
        sub="dari seluruh wilayah pesisir"
        accent="#f59e0b"
        accentBg="#fffbeb"
        icon="ti-waves"
      />
      <StatCard
        label="Suhu Rata-rata"
        value={avgTemp != null ? `${avgTemp}°C` : "- °C"}
        sub={`${weatherData.length} kelurahan terpantau`}
        accent="#16a34a"
        accentBg="#f0fdf4"
        icon="ti-temperature"
      />
    </div>
  );
}