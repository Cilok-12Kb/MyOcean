export default function WeatherPopup({ item }) {
  const rowStyle = {
    display: "grid",
    gridTemplateColumns: "160px 1fr",
    alignItems: "center",
    marginBottom: "8px",
  };
  return (
    <div style={{ minWidth: "220px", padding: "12px" }}>
      <h6 className="fw-bold mb-1">
        {item.desa}
      </h6>
      <small style={{ color: "#64748b" }}>
        Kecamatan {item.kecamatan}
      </small>
      <div className="mt-3">
        <div style={rowStyle}>
          <span style={{ color: "#64748b" }}>🌤️ Cuaca</span>
          <strong>{item.cuaca}</strong>
        </div>
        <div style={rowStyle}>
          <span style={{ color: "#64748b" }}>🌡️ Suhu</span>
          <strong>{item.suhu}°C</strong>
        </div>
        <div style={{ ...rowStyle, marginBottom: 0 }}>
          <span style={{ color: "#64748b" }}>💧 Kelembapan</span>
          <strong>{item.kelembapan}%</strong>
        </div>
      </div>
    </div>
  );
}