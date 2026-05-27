export default function ForecastCard({ jam }) {

  return (

    <div
      className="flex-shrink-0 rounded-4 p-3"
      style={{
        width: "240px",
        background:
          "linear-gradient(to bottom right, #ffffff, #f8fafc)",
        border:
          "1px solid rgba(0,0,0,0.06)",
      }}
    >

      <div className="mb-3">

        <small
          style={{
            color: "#64748b",
          }}
        >
          Waktu
        </small>

        <div
          style={{
            fontSize: "12px",
            color: "#0ea5e9",
            fontWeight: "600",
            marginBottom: "4px",
          }}
        >
          {new Date(jam.local_datetime)
            .toLocaleDateString("id-ID", {
              weekday: "long",
            })}
        </div>

        <div
          className="fw-bold"
          style={{
            color: "#0f172a",
          }}
        >
          {jam.local_datetime}
        </div>

      </div>

      <div
        className="rounded-4 p-3 mb-3"
        style={{
          background: "#eff6ff",
        }}
      >

        <div
          className="fw-semibold mb-1"
          style={{
            color: "#0369a1",
          }}
        >
          🌤️ {jam.weather_desc}
        </div>

        <div
          style={{
            fontSize: "32px",
            fontWeight: "700",
            color: "#0f172a",
          }}
        >
          {jam.t}°C
        </div>

      </div>

      <div className="d-flex justify-content-between mb-2">
        <span>Kelembapan</span>
        <strong>{jam.hu}%</strong>
      </div>

      <div className="d-flex justify-content-between mb-2">
        <span>Angin</span>
        <strong>{jam.ws} km/jam</strong>
      </div>

      <div className="d-flex justify-content-between">
        <span>Jarak Pandang</span>
        <strong>{jam.vs_text || "-"}</strong>
      </div>

    </div>
  );
}