import { useEffect, useState } from "react";
import PublicNavbar from "../../components/PublicNavbar";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

const weatherIcon = new L.Icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/4834/4834559.png",
  iconSize: [34, 34],
});

export default function Cuaca() {

  const [cuacaList, setCuacaList] = useState([]);
  const [selectedWilayah, setSelectedWilayah] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchCuaca = async () => {

      try {

        const response = await fetch(
          "http://127.0.0.1:8000/api/cuaca-semarang"
        );

        const data = await response.json();

        console.log("DATA BMKG:", data);

        if (!data.data) {
          return;
        }

        const hasil = data.data.map((item) => {

          const prakiraan =
            item.cuaca?.[0] || [];

          const current =
            prakiraan[0] || {};

          return {

            desa: item.lokasi?.desa,
            kecamatan: item.lokasi?.kecamatan,

            lat: Number(item.lokasi?.lat),
            lon: Number(item.lokasi?.lon),

            suhu: current?.t,
            cuaca: current?.weather_desc,

            kelembapan: current?.hu,
            angin: current?.ws,

            waktu: current?.local_datetime,

            prakiraan,

          };

        });

        setCuacaList(hasil);

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }

    };

    fetchCuaca();

  }, []);

  return (

    <>

      <PublicNavbar />

      <div
        className="min-vh-100 py-4 px-3 px-md-4"
        style={{
          background:
            "linear-gradient(to bottom, #f8fafc, #eef2ff)",
        }}
      >

        <div
          className="rounded-5 overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.92)",
            border:
              "1px solid rgba(0,0,0,0.06)",
            boxShadow:
              "0 10px 40px rgba(15,23,42,0.06)",
          }}
        >

          {/* HEADER */}
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
                  Peta Cuaca Kota Semarang
                </h1>

                <p
                  className="mb-0"
                  style={{
                    color: "#64748b",
                    maxWidth: "760px",
                    lineHeight: "1.8",
                  }}
                >
                  Monitoring prakiraan cuaca realtime
                  seluruh wilayah Kota Semarang
                  berbasis data BMKG dengan
                  visualisasi interaktif.
                </p>

              </div>

              <div
                className="rounded-4 px-4 py-3"
                style={{
                  background: "#ffffff",
                  border:
                    "1px solid rgba(0,0,0,0.06)",
                  minWidth: "180px",
                }}
              >

                <small
                  style={{
                    color: "#64748b",
                  }}
                >
                  Total Wilayah
                </small>

                <h2
                  className="fw-bold mb-0 mt-1"
                  style={{
                    color: "#0f172a",
                  }}
                >
                  {cuacaList.length}
                </h2>

              </div>

            </div>

          </div>

          {/* CONTENT */}
          <div className="p-4">

            <div className="row g-4">

              {/* MAP */}
              <div className="col-lg-8">

                <div
                  className="overflow-hidden rounded-5"
                  style={{
                    border:
                      "1px solid rgba(0,0,0,0.06)",
                  }}
                >

                  {loading ? (

                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        height: "700px",
                      }}
                    >

                      <div className="text-center">

                        <div
                          className="spinner-border text-info mb-3"
                          role="status"
                        />

                        <p
                          style={{
                            color: "#64748b",
                          }}
                        >
                          Loading data cuaca...
                        </p>

                      </div>

                    </div>

                  ) : (

                    <MapContainer
                      center={[-6.9667, 110.4167]}
                      zoom={11}
                      style={{
                        height: "750px",
                        width: "100%",
                      }}
                    >

                      <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />

                      {cuacaList.map((item, index) => (

                        <Marker
                          key={index}
                          position={[
                            item.lat,
                            item.lon,
                          ]}
                          icon={weatherIcon}
                        >

                          <Popup>

                            <div
                              style={{
                                minWidth: "220px",
                              }}
                            >

                              <h6
                                className="fw-bold mb-1"
                              >
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

                                  <span>
                                    🌤️ Cuaca
                                  </span>

                                  <strong>
                                    {item.cuaca}
                                  </strong>

                                </div>

                                <div className="d-flex justify-content-between mb-2">

                                  <span>
                                    🌡️ Suhu
                                  </span>

                                  <strong>
                                    {item.suhu}°C
                                  </strong>

                                </div>

                                <div className="d-flex justify-content-between">

                                  <span>
                                    💧 Kelembapan
                                  </span>

                                  <strong>
                                    {item.kelembapan}%
                                  </strong>

                                </div>

                              </div>

                            </div>

                          </Popup>

                        </Marker>

                      ))}

                    </MapContainer>

                  )}

                </div>

              </div>

              {/* SIDEBAR */}
              <div className="col-lg-4">

                <div
                  className="rounded-5 p-4 h-100"
                  style={{
                    background: "#ffffff",
                    border:
                      "1px solid rgba(0,0,0,0.06)",
                  }}
                >

                  <div className="d-flex justify-content-between align-items-center mb-4">

                    <h5
                      className="fw-bold mb-0"
                      style={{
                        color: "#0f172a",
                      }}
                    >
                      Data Wilayah
                    </h5>

                    <span
                      className="badge rounded-pill text-bg-info"
                    >
                      BMKG
                    </span>

                  </div>

                  {/* TABLE */}
                  <div
                    style={{
                      maxHeight: "220px",
                      overflowY: "auto",
                    }}
                  >

                    <table className="table align-middle">

                      <thead>

                        <tr>

                          <th>
                            Wilayah
                          </th>

                          <th>
                            Suhu
                          </th>

                          <th>
                            Aksi
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {cuacaList.map((item, index) => (

                          <tr key={index}>

                            <td>

                              <div
                                className="fw-semibold"
                              >
                                {item.desa}
                              </div>

                              <small
                                className="text-secondary"
                              >
                                {item.kecamatan}
                              </small>

                            </td>

                            <td>

                              <strong>
                                {item.suhu}°C
                              </strong>

                            </td>

                            <td>

                              <button
                                className={`btn btn-sm rounded-pill ${
                                  selectedWilayah?.desa === item.desa
                                    ? "btn-primary"
                                    : "btn-outline-primary"
                                }`}
                                onClick={() =>
                                  setSelectedWilayah(item)
                                }
                              >
                                Lihat
                              </button>

                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                  {/* DETAIL PRAKIRAAN */}
                  {selectedWilayah ? (

                    <div className="mt-4">

                      <div className="mb-3">

                        <h5
                          className="fw-bold mb-1"
                          style={{
                            color: "#0f172a",
                          }}
                        >
                          {selectedWilayah.desa}
                        </h5>

                        <small
                          style={{
                            color: "#64748b",
                          }}
                        >
                          Kecamatan{" "}
                          {selectedWilayah.kecamatan}
                        </small>

                      </div>

                      {/* CARD SLIDER */}
                      <div
                        className="d-flex gap-3 overflow-auto pb-2"
                        style={{
                          scrollSnapType: "x mandatory",
                        }}
                      >

                        {selectedWilayah.prakiraan.map(
                          (jam, index) => (

                            <div
                              key={index}
                              className="flex-shrink-0 rounded-4 p-3"
                              style={{
                                width: "240px",
                                background:
                                  "linear-gradient(to bottom right, #ffffff, #f8fafc)",
                                border:
                                  "1px solid rgba(0,0,0,0.06)",
                                scrollSnapAlign:
                                  "start",
                                boxShadow:
                                  "0 4px 20px rgba(15,23,42,0.05)",
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
                                  background:
                                    "#eff6ff",
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

                                <span
                                  style={{
                                    color: "#64748b",
                                  }}
                                >
                                  Kelembapan
                                </span>

                                <strong>
                                  {jam.hu}%
                                </strong>

                              </div>

                              <div className="d-flex justify-content-between mb-2">

                                <span
                                  style={{
                                    color: "#64748b",
                                  }}
                                >
                                  Angin
                                </span>

                                <strong>
                                  {jam.ws} km/jam
                                </strong>

                              </div>

                              <div className="d-flex justify-content-between">

                                <span
                                  style={{
                                    color: "#64748b",
                                  }}
                                >
                                  Jarak Pandang
                                </span>

                                <strong>
                                  {jam.vs_text || "-"}
                                </strong>

                              </div>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  ) : (

                    <div
                      className="mt-4 text-center py-5 rounded-4"
                      style={{
                        background: "#f8fafc",
                        border:
                          "1px dashed rgba(0,0,0,0.1)",
                      }}
                    >

                      <div
                        style={{
                          fontSize: "40px",
                        }}
                      >
                        🌤️
                      </div>

                      <h6
                        className="fw-bold mt-3"
                        style={{
                          color: "#0f172a",
                        }}
                      >
                        Pilih Wilayah
                      </h6>

                      <p
                        className="mb-0"
                        style={{
                          color: "#64748b",
                          fontSize: "14px",
                        }}
                      >
                        Klik tombol "Lihat"
                        pada tabel untuk melihat
                        prakiraan cuaca per jam.
                      </p>

                    </div>

                  )}

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </>

  );

}