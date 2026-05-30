import { useState, useEffect } from "react";

export default function WeatherSidebar({ filteredCuaca }) {

  const [selectedDesa, setSelectedDesa] = useState(null);

  // DERIVE selectedWilayah dari filteredCuaca yang selalu fresh
  // Setiap kali filteredCuaca refresh (60 detik), data ini ikut update otomatis
  const selectedWilayah = selectedDesa
    ? filteredCuaca.find((item) => item.desa === selectedDesa) || null
    : null;

  // Jika wilayah yang dipilih hilang dari filter, reset selection
  useEffect(() => {
    if (selectedDesa && !filteredCuaca.find((item) => item.desa === selectedDesa)) {
      setSelectedDesa(null);
    }
  }, [filteredCuaca, selectedDesa]);

  return (

    <div
      className="rounded-5 p-4 h-100"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <h5 className="fw-bold mb-0" style={{ color: "#0f172a" }}>
          Data Wilayah
        </h5>

        <span className="badge rounded-pill text-bg-info">
          BMKG
        </span>

      </div>

      {/* TABLE */}
      <div style={{ maxHeight: "200px", overflowY: "auto" }}>

        <table className="table align-middle">

          <thead>
            <tr>
              <th>Wilayah</th>
              <th>Suhu</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>

            {filteredCuaca.map((item, index) => (

              <tr key={index}>

                <td>
                  <div className="fw-semibold">{item.desa}</div>
                  <small className="text-secondary">{item.kecamatan}</small>
                </td>

                <td>
                  <strong>{item.suhu}°C</strong>
                </td>

                <td>

                  <button
                    className={`btn btn-sm rounded-pill ${
                      selectedDesa === item.desa
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setSelectedDesa(item.desa)}
                  >
                    Lihat
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* FORECAST DETAIL */}
      {selectedWilayah ? (

        <ForecastDetail wilayah={selectedWilayah} />

      ) : (

        <EmptyForecast />

      )}

    </div>

  );

}

function ForecastDetail({ wilayah }) {

  return (

    <div className="mt-4">

      <div className="mb-3">

        <h5 className="fw-bold mb-1" style={{ color: "#0f172a" }}>
          {wilayah.desa}
        </h5>

        <small style={{ color: "#64748b" }}>
          Kecamatan {wilayah.kecamatan}
        </small>

      </div>

      {/* CARD SLIDER */}
      <div
        className="d-flex gap-3 overflow-auto pb-2"
        style={{ scrollSnapType: "x mandatory" }}
      >

        {wilayah.prakiraan.map((jam, index) => (

          <div
            key={index}
            className="flex-shrink-0 rounded-4 p-3"
            style={{
              width: window.innerWidth < 768 ? "200px" : "240px",
              background: "linear-gradient(to bottom right, #ffffff, #f8fafc)",
              border: "1px solid rgba(0,0,0,0.06)",
              scrollSnapAlign: "start",
              boxShadow: "0 4px 20px rgba(15,23,42,0.05)",
            }}
          >

            <div className="mb-3">

              <small style={{ color: "#64748b" }}>Waktu</small>

              <div
                style={{
                  fontSize: "12px",
                  color: "#0ea5e9",
                  fontWeight: "600",
                  marginBottom: "4px",
                }}
              >
                {new Date(jam.local_datetime).toLocaleDateString("id-ID", {
                  weekday: "long",
                })}
              </div>

              <div className="fw-bold" style={{ color: "#0f172a" }}>
                {jam.local_datetime}
              </div>

            </div>

            <div
              className="rounded-4 p-3 mb-3"
              style={{ background: "#eff6ff" }}
            >

              <div
                className="fw-semibold mb-1"
                style={{ color: "#0369a1" }}
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
              <span style={{ color: "#64748b" }}>Kelembapan</span>
              <strong>{jam.hu}%</strong>
            </div>

            <div className="d-flex justify-content-between mb-2">
              <span style={{ color: "#64748b" }}>Angin</span>
              <strong>{jam.ws} km/jam</strong>
            </div>

            <div className="d-flex justify-content-between">
              <span style={{ color: "#64748b" }}>Jarak Pandang</span>
              <strong>{jam.vs_text || "-"}</strong>
            </div>

          </div>

        ))}

      </div>

    </div>

  );

}

function EmptyForecast() {

  return (

    <div
      className="mt-4 text-center py-5 rounded-4"
      style={{
        background: "#f8fafc",
        border: "1px dashed rgba(0,0,0,0.1)",
      }}
    >

      <div style={{ fontSize: "40px" }}>🌤️</div>

      <h6 className="fw-bold mt-3" style={{ color: "#0f172a" }}>
        Pilih Wilayah
      </h6>

      <p
        className="mb-0"
        style={{ color: "#64748b", fontSize: "14px" }}
      >
        Klik tombol "Lihat" pada tabel untuk melihat prakiraan cuaca per jam.
      </p>

    </div>

  );

}