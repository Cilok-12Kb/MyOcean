// src/pages/Peta.jsx
import PublicNavbar from "../../components/PublicNavbar";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
} from "react-leaflet";
import ReactDOM from "react-dom";
import { useEffect, useState, useRef } from "react";
import api from "../../services/api";
import "../../styles/Peta.css";

const SEMARANG_CENTER = [-6.9667, 110.4167];

const SEMARANG_BOUNDS = [
  [-7.15, 110.25],
  [-6.82, 110.58],
];

// ── Helper ──────────────────────────────────────────────────────────────────

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// Tentukan warna overlay polygon berdasarkan tinggi_rob (dalam meter)
function getRobColor(tinggiRob, tergenang) {
  if (!tergenang || tinggiRob <= 0) return "#23c000"; // hijau: aman
  if (tinggiRob < 0.4)  return "#ffff00";             // kuning: rendah
  if (tinggiRob < 0.7)  return "#ffb000";             // oranye: sedang
  return "#ff0000";                                    // merah: tinggi
}

function getRobLevelText(tinggiRob, tergenang) {
  if (!tergenang || tinggiRob <= 0) return "Tenang";
  if (tinggiRob < 0.4) return "Rendah";
  if (tinggiRob < 0.7) return "Sedang";
  return "Tinggi";
}

// ── Legend overlay di dalam peta (pojok kanan bawah) ────────────────────────

const LEGEND_ITEMS = [
  { color: "#23c000", label: "Tenang" },
  { color: "#ffff00", label: "Rendah (< 0.4 m)" },
  { color: "#ffb000", label: "Sedang (0.4 – 0.7 m)" },
  { color: "#ff0000", label: "Tinggi (> 0.7 m)" },
];

function MapLegend() {
  const map = useMap();
  const container = map.getContainer();

  return ReactDOM.createPortal(
    <div
      style={{
        position: "absolute",
        bottom: "32px",
        right: "10px",
        zIndex: 1000,
        background: "white",
        borderRadius: "8px",
        padding: "10px 14px",
        fontSize: "12px",
        boxShadow: "0 1px 5px rgba(0,0,0,0.2)",
        lineHeight: "1.8",
        pointerEvents: "none",
        minWidth: "170px",
      }}
    >
      <p
        style={{
          margin: "0 0 6px",
          fontWeight: 600,
          fontSize: "11px",
          color: "#64748b",
          letterSpacing: "0.5px",
          textTransform: "uppercase",
        }}
      >
        Potensi Rob (Pasang Surut)
      </p>
      {LEGEND_ITEMS.map(({ color, label }) => (
        <div
          key={label}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: 3,
              background: color,
              display: "inline-block",
              border: "1px solid rgba(0,0,0,0.15)",
              flexShrink: 0,
            }}
          />
          <span style={{ color: "#374151" }}>{label}</span>
        </div>
      ))}
    </div>,
    container
  );
}

// ── Komponen tabel detail tinggi tanah (di bawah peta) ──────────────────────

function TabelWilayah({ robData }) {
  if (!robData || robData.length === 0) return null;

  return (
    <div className="wilayah-table-wrapper mt-3">
      <h2 className="wilayah-table-heading">DETAIL WILAYAH POTENSI ROB</h2>
      {robData[0]?.data_air_at && (
        <p className="wilayah-table-note text-muted small mb-2">
          Data pasang surut: <strong>{robData[0].data_air_at} WIB</strong>
        </p>
      )}
      <div className="table-responsive">
        <table className="table table-hover wilayah-table align-middle mb-0">
          <thead>
            <tr>
              <th>#</th>
              <th>Nama Wilayah</th>
              <th>Tinggi Tanah</th>
              <th>Tinggi Air</th>
              <th>Tinggi Rob</th>
              <th>Potensi Rob</th>
              <th>Geometri Peta</th>
            </tr>
          </thead>
          <tbody>
            {robData.map((item, idx) => {
              const level = getRobLevelText(item.tinggi_rob, item.tergenang);
              const color = getRobColor(item.tinggi_rob, item.tergenang);
              return (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td className="fw-semibold">{item.nama_wilayah}</td>
                  <td>{item.tinggi_tanah} m</td>
                  <td>{item.tinggi_air != null ? `${item.tinggi_air} m` : "-"}</td>
                  <td>{item.tinggi_rob > 0 ? `${item.tinggi_rob} m` : "Tidak tergenang"}</td>
                  <td>
                    <span
                      className="rob-level-badge"
                      style={{ background: color }}
                    >
                      {level}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${item.geometry ? "bg-success" : "bg-secondary"}`}>
                      {item.geometry ? "Ada" : "Belum ada"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Komponen layer GeoJSON untuk overlay polygon ─────────────────────────────

function RobOverlayLayer({ robData }) {
  const geoJsonRef = useRef(null);

  const features = robData
    .filter(item => item.geometry)
    .map(item => ({
      type: "Feature",
      properties: {
        nama_wilayah: item.nama_wilayah,
        tinggi_rob:   item.tinggi_rob,
        tinggi_tanah: item.tinggi_tanah,
        tinggi_air:   item.tinggi_air,
        tergenang:    item.tergenang,
      },
      geometry: item.geometry,
    }));

  if (features.length === 0) return null;

  const featureCollection = { type: "FeatureCollection", features };

  function style(feature) {
    const { tinggi_rob, tergenang } = feature.properties;
    const color = getRobColor(tinggi_rob, tergenang);
    return {
      fillColor: color,
      fillOpacity: 0.45,
      color: color,
      weight: 2,
      opacity: 0.8,
    };
  }

  function onEachFeature(feature, layer) {
    const p = feature.properties;
    const level = getRobLevelText(p.tinggi_rob, p.tergenang);
    layer.bindPopup(`
      <div class="rob-polygon-popup">
        <strong>${p.nama_wilayah}</strong><br/>
        Tinggi tanah: ${p.tinggi_tanah} m<br/>
        Tinggi air: ${p.tinggi_air != null ? p.tinggi_air + " m" : "-"}<br/>
        Rob: ${p.tinggi_rob > 0 ? p.tinggi_rob + " m" : "Tidak tergenang"}<br/>
        Potensi: <strong>${level}</strong>
      </div>
    `);

    layer.on("mouseover", () => layer.setStyle({ fillOpacity: 0.7, weight: 3 }));
    layer.on("mouseout",  () => layer.setStyle({ fillOpacity: 0.45, weight: 2 }));
  }

  return (
    <GeoJSON
      ref={geoJsonRef}
      key={JSON.stringify(features.map(f => f.properties.tinggi_rob))}
      data={featureCollection}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
}

// ── Komponen utama ───────────────────────────────────────────────────────────

function PetaContent() {
  const [robData, setRobData] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchAll() {
    setLoading(true);
    try {
      const robRes = await api.get("/peta/rob-data");
      setRobData(robRes.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data peta:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  return (
    <main className="peta-page">
      <div className="peta-card">
        {loading && <div className="map-loading">Memuat data peta...</div>}

        <div>
          <p className="mb-2" style={{ color: "#0ea5e9", letterSpacing: "2px", fontWeight: "700", fontSize: "13px" }}>
            BMKG MAP VIEW
          </p>
          <h1 className="fw-bold mb-3" style={{ fontSize: "42px", color: "#0f172a" }}>
            Peta Wilayah Potensi Rob Semarang
          </h1>
        </div>

        <MapContainer
          center={SEMARANG_CENTER}
          zoom={11}
          minZoom={8}
          maxZoom={18}
          maxBounds={SEMARANG_BOUNDS}
          className="peta-map"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Legend overlay di pojok kanan bawah peta */}
          <MapLegend />

          {/* Overlay polygon rob — wilayah yang punya GeoJSON geometry */}
          <RobOverlayLayer robData={robData} />

        </MapContainer>

        {/* Tabel detail di bawah peta */}
        <TabelWilayah robData={robData} />
      </div>
    </main>
  );
}

export default function Peta() {
  return (
    <>
      <PublicNavbar />
      <PetaContent />
    </>
  );
}