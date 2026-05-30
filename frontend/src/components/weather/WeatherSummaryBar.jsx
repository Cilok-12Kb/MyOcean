// src/components/weather/WeatherSummaryBar.jsx
export default function WeatherSummaryBar({ rata, loading }) {
  const items = [
    { icon: "ti-temperature",  label: "Suhu rata-rata",    value: rata?.suhu           != null ? `${rata.suhu}°C`       : "-",      color: "#ef4444", bg: "#fef2f2" },
    { icon: "ti-droplet",      label: "Kelembapan",        value: rata?.kelembapan     != null ? `${rata.kelembapan}%`  : "-",      color: "#0ea5e9", bg: "#f0f9ff" },
    { icon: "ti-wind",         label: "Kec. angin",        value: rata?.kecepatan_angin != null ? `${rata.kecepatan_angin} km/j` : "-", color: "#0284c7", bg: "#e0f2fe" },
    { icon: "ti-compass",      label: "Arah angin dominan",value: rata?.arah_angin     ?? "-",                                      color: "#7c3aed", bg: "#f5f3ff" },
    { icon: "ti-cloud",   label: "Cuaca dominan", value: rata?.cuaca ?? "-", color: "#64748b", bg: "#f1f5f9" },
  ];

  if (loading) {
    return (
      <div style={s.bar}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ ...s.item, background: "#f1f5f9" }}>
            <div style={{ width: 80, height: 14, background: "#e2e8f0", borderRadius: 6 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={s.bar}>
      {items.map((item) => (
        <div key={item.label} style={{ ...s.item, background: item.bg }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <i className={`ti ${item.icon}`} style={{ fontSize: 18, color: item.color }} />
          </div>
          <div>
            <div style={s.val}>{item.value}</div>
            <div style={s.lbl}>{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const s = {
  bar:  { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, padding: "16px 24px" },
  item: { display: "flex", alignItems: "center", gap: 10, borderRadius: 10, padding: "10px 14px" },
  val:  { fontSize: 15, fontWeight: 700, color: "#0f172a" },
  lbl:  { fontSize: 11, color: "#64748b", marginTop: 1 },
};