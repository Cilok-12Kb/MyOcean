export default function WeatherHeader({ totalWilayah, lastUpdate }) {

  return (

    <div className="p-4 p-md-5 pb-0">

      <div className="d-flex justify-content-between align-items-start flex-wrap gap-4">

        <div>

          <p
            className="mb-2"
            style={{
              color: "#0ea5e9",
              letterSpacing: "2px",
              fontWeight: "700",
              fontSize: "13px",
            }}
          >
            BMKG WEATHER MONITORING
          </p>

          <h1
            className="fw-bold mb-3"
            style={{
              fontSize: "42px",
              color: "#0f172a",
            }}
          >
            Peta Prakiraan Cuaca Kota Semarang
          </h1>

          <p
            className="mb-0"
            style={{
              color: "#64748b",
              maxWidth: "100vh",
              lineHeight: "1.8",
            }}
          >
            Monitoring prakiraan cuaca realtime seluruh wilayah Kota Semarang
            berbasis data BMKG dengan visualisasi interaktif.
          </p>

        </div>

        <div
          className="rounded-4 px-4 py-3"
          style={{
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.06)",
            minWidth: "220px",
          }}
        >

          <small style={{ color: "#64748b" }}>
            Total Wilayah
          </small>

          <h2
            className="fw-bold mb-2 mt-1"
            style={{ color: "#0f172a" }}
          >
            {totalWilayah}
          </h2>

          <div
            className="pt-2"
            style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
          >

            <small style={{ color: "#64748b", fontSize: "12px" }}>
              Update terakhir
            </small>

            <div
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#0f172a",
              }}
            >
              {lastUpdate || "-"}
            </div>

          </div>

        </div>

      </div>

    </div>

  );

}