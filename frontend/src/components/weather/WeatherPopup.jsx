export default function WeatherPopup({ item }) {

  return (

    <div
      style={{
        minWidth: "220px",
      }}
    >

      <h6 className="fw-bold mb-1">
        {item.desa}
      </h6>

      <small
        style={{
          color: "#64748b",
        }}
      >
        Kecamatan {item.kecamatan}
      </small>

      <div className="mt-3">

        <div className="d-flex justify-content-between mb-2">
          <span>🌤️ Cuaca</span>
          <strong>{item.cuaca}</strong>
        </div>

        <div className="d-flex justify-content-between mb-2">
          <span>🌡️ Suhu</span>
          <strong>{item.suhu}°C</strong>
        </div>

        <div className="d-flex justify-content-between">
          <span>💧 Kelembapan</span>
          <strong>{item.kelembapan}%</strong>
        </div>

      </div>

    </div>
  );
}