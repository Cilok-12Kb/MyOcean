// src/pages/Admin/PetaAdmin.jsx
import { useEffect, useState, useRef } from "react";
import {
  Container, Row, Col, Card, Button, Spinner, Badge,
} from "react-bootstrap";
import {
  MapContainer, TileLayer, GeoJSON, Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../services/api";

import AdminNavbar from "../../components/EndminNavbar";
import EndminTopbar from "../../components/EndminTopbar";
import ModalWilayahRob from "../../components/PasangSurut/ModalWilayahRob";
import ModalPetaWilayah from "../../components/PasangSurut/ModalPetaWilayah";

const SEMARANG_CENTER = [-6.9667, 110.4167];

// ── Helper ───────────────────────────────────────────────────────────────────

function getRobPotential(tinggiRob) {
  if (tinggiRob >= 0.7) return "Tinggi";
  if (tinggiRob >= 0.4) return "Sedang";
  if (tinggiRob > 0)    return "Rendah";
  return "Tenang";
}

function getRobBadgeVariant(potential) {
  switch (potential) {
    case "Tinggi": return "danger";
    case "Sedang": return "warning";
    case "Rendah": return "primary";
    default:       return "success";
  }
}

function getRobColor(tinggiRob, tergenang) {
  if (!tergenang || tinggiRob <= 0) return "#23c000";
  if (tinggiRob < 0.4)  return "#ffff00";
  if (tinggiRob < 0.7)  return "#ffb000";
  return "#ff0000";
}

// ── Komponen peta ─────────────────────────────────────────────────────────────

function AdminPetaMap({ robData }) {
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

  const hasGeometry = features.length > 0;

  function polygonStyle(feature) {
    const { tinggi_rob, tergenang } = feature.properties;
    const color = getRobColor(tinggi_rob, tergenang);
    return {
      fillColor:   color,
      fillOpacity: 0.5,
      color:       color,
      weight:      2,
      opacity:     0.9,
    };
  }

  function onEachFeature(feature, layer) {
    const p = feature.properties;
    const level = getRobPotential(p.tinggi_rob);
    layer.bindPopup(`
      <div style="font-size:13px;min-width:170px;line-height:1.7">
        <strong style="font-size:14px;display:block;margin-bottom:4px">${p.nama_wilayah}</strong>
        Tinggi tanah: <b>${p.tinggi_tanah} m</b><br/>
        Tinggi air: <b>${p.tinggi_air != null ? p.tinggi_air + " m" : "-"}</b><br/>
        Rob: <b>${p.tinggi_rob > 0 ? p.tinggi_rob + " m" : "Tidak tergenang"}</b><br/>
        Potensi: <b>${level}</b>
      </div>
    `);
    layer.on("mouseover", () => layer.setStyle({ fillOpacity: 0.75, weight: 3 }));
    layer.on("mouseout",  () => layer.setStyle({ fillOpacity: 0.5,  weight: 2 }));
  }

  return (
    <Card className="shadow-sm border-0 rounded-4 mb-4">
      <Card.Body className="p-3 p-md-4">
        <Row className="align-items-center g-2 mb-3">
          <Col xs={12} md="auto" className="me-md-auto">
            <h5 className="mb-0 fw-bold">Peta Potensi Rob</h5>
            <small className="text-muted">
              {hasGeometry
                ? `${features.length} wilayah tampil dengan overlay potensi rob`
                : "Belum ada wilayah yang memiliki geometri peta — kelola di tombol 'Kelola Geometri Peta'"}
            </small>
          </Col>
          {/* Legenda */}
          <Col xs={12} md="auto">
            <div className="d-flex flex-wrap gap-2 align-items-center" style={{ fontSize: 12 }}>
              {[
                { label: "Tenang",  color: "#23c000" },
                { label: "Rendah",  color: "#ffff00" },
                { label: "Sedang",  color: "#ffb000" },
                { label: "Tinggi",  color: "#ff0000" },
              ].map(({ label, color }) => (
                <span key={label} className="d-flex align-items-center gap-1">
                  <span style={{
                    display: "inline-block", width: 14, height: 14,
                    background: color, border: "1px solid #333", borderRadius: 2,
                  }} />
                  {label}
                </span>
              ))}
            </div>
          </Col>
        </Row>

        <MapContainer
          center={SEMARANG_CENTER}
          zoom={12}
          style={{ height: 480, width: "100%", borderRadius: 16, zIndex: 1 }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {hasGeometry && (
            <GeoJSON
              ref={geoJsonRef}
              key={JSON.stringify(features.map(f => f.properties.tinggi_rob))}
              data={{ type: "FeatureCollection", features }}
              style={polygonStyle}
              onEachFeature={onEachFeature}
            />
          )}

          {!hasGeometry && (
            // Placeholder info overlay saat belum ada geometri
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.7)", zIndex: 500,
              borderRadius: 16, pointerEvents: "none",
            }}>
              <div className="text-center text-muted">
                <div style={{ fontSize: 36 }}>🗺️</div>
                <div className="fw-semibold mt-2">Belum ada geometri wilayah</div>
                <small>Tambahkan melalui tombol "Kelola Geometri Peta"</small>
              </div>
            </div>
          )}
        </MapContainer>
      </Card.Body>
    </Card>
  );
}

// ── Komponen tabel wilayah rob ───────────────────────────────────────────────

function WilayahTable({ data, loading }) {
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" className="me-2" />
        <span className="text-muted">Memuat data wilayah...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-muted py-5">
        Belum ada data wilayah rob. Klik <strong>"Kelola Wilayah"</strong> untuk menambahkan.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0" style={{ fontSize: 14 }}>
        <thead className="table-light">
          <tr>
            <th style={{ width: 40 }}>#</th>
            <th>Nama Wilayah</th>
            <th>Tinggi Tanah</th>
            <th>Tinggi Air Terkini</th>
            <th>Tinggi Rob</th>
            <th>Potensi Rob</th>
            <th>Geometri Peta</th>
            <th>Data Air</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => {
            const potential = getRobPotential(item.tinggi_rob);
            return (
              <tr key={item.id}>
                <td className="text-muted">{idx + 1}</td>
                <td className="fw-semibold">{item.nama_wilayah}</td>
                <td>{item.tinggi_tanah} m</td>
                <td>
                  {item.tinggi_air != null
                    ? `${item.tinggi_air} m`
                    : <span className="text-muted">-</span>}
                </td>
                <td>
                  {item.tinggi_rob > 0
                    ? <strong>{item.tinggi_rob} m</strong>
                    : <span className="text-muted">Tidak tergenang</span>}
                </td>
                <td>
                  <Badge bg={getRobBadgeVariant(potential)} className="px-2 py-1">
                    {potential}
                  </Badge>
                </td>
                <td>
                  <Badge
                    bg={item.geometry ? "success" : "secondary"}
                    className="px-2 py-1"
                    style={{ fontSize: 11 }}
                  >
                    {item.geometry ? "✓ Ada" : "Belum ada"}
                  </Badge>
                </td>
                <td className="text-muted" style={{ fontSize: 12 }}>
                  {item.data_air_at ?? "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color }) {
  return (
    <Card className="shadow-sm border-0 rounded-4 h-100">
      <Card.Body className="p-3">
        <div className="text-muted small mb-1">{label}</div>
        <div className="fw-bold" style={{ fontSize: 28, color }}>{value}</div>
        {sub && <div className="text-muted" style={{ fontSize: 12 }}>{sub}</div>}
      </Card.Body>
    </Card>
  );
}

// ── Halaman utama ─────────────────────────────────────────────────────────────

export default function PetaAdmin() {
  const [robData,  setRobData]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showModalWilayah, setShowModalWilayah] = useState(false);
  const [showModalPeta,    setShowModalPeta]    = useState(false);

  async function fetchRobData() {
    setLoading(true);
    try {
      const res = await api.get("/peta/rob-data");
      setRobData(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data peta rob:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchRobData(); }, []);

  const totalWilayah      = robData.length;
  const tergenang         = robData.filter(w => w.tergenang).length;
  const sudahGeometri     = robData.filter(w => w.geometry).length;
  const dataAirAt         = robData.length > 0 ? robData[0].data_air_at : null;
  const tinggiRobMax      = robData.length > 0 ? Math.max(...robData.map(w => w.tinggi_rob ?? 0)) : 0;
  const potensialTertinggi = getRobPotential(tinggiRobMax);

  return (
    <>
      <AdminNavbar />
      <EndminTopbar />

      <main
        style={{
          background: "linear-gradient(to bottom, #f8fafc, #eef2ff)",
          paddingTop: "100px",
          paddingBottom: "32px",
          minHeight: "100vh",
        }}
        className="px-3 px-md-4"
      >
        <Container fluid="xl">

          {/* ── Toolbar ── */}
          <Card className="shadow-sm border-0 rounded-4 mb-4">
            <Card.Body className="p-3">
              <Row className="g-2 align-items-center">
                <Col xs={12} md="auto" className="me-md-auto">
                  <h5 className="mb-0 fw-bold">Kelola Peta & Wilayah Rob</h5>
                  <small className="text-muted">
                    Manajemen wilayah, tinggi tanah, dan geometri peta potensi rob
                  </small>
                </Col>
                <Col xs={12} md="auto">
                  <div className="d-flex flex-wrap gap-2">
                    <Button variant="primary" onClick={() => setShowModalWilayah(true)}>
                      <i className="bi bi-geo-alt me-1" />
                      Kelola Wilayah
                    </Button>
                    <Button variant="outline-primary" onClick={() => setShowModalPeta(true)}>
                      <i className="bi bi-map me-1" />
                      Kelola Geometri Peta
                    </Button>
                    <Button variant="outline-secondary" onClick={fetchRobData} disabled={loading}>
                      {loading
                        ? <Spinner size="sm" animation="border" />
                        : <i className="bi bi-arrow-clockwise" />}
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* ── Stat cards ── */}
          <Row className="g-3 mb-4">
            <Col xs={6} md={3}>
              <StatCard label="Total Wilayah" value={totalWilayah} sub="wilayah terdaftar" color="#0ea5e9" />
            </Col>
            <Col xs={6} md={3}>
              <StatCard
                label="Wilayah Tergenang"
                value={tergenang}
                sub={`dari ${totalWilayah} wilayah`}
                color={tergenang > 0 ? "#ef4444" : "#22c55e"}
              />
            </Col>
            <Col xs={6} md={3}>
              <StatCard
                label="Potensi Tertinggi"
                value={potensialTertinggi}
                sub={`rob maks ${tinggiRobMax.toFixed(2)} m`}
                color={
                  potensialTertinggi === "Tinggi" ? "#ef4444" :
                  potensialTertinggi === "Sedang" ? "#f59e0b" :
                  potensialTertinggi === "Rendah" ? "#3b82f6" : "#22c55e"
                }
              />
            </Col>
            <Col xs={6} md={3}>
              <StatCard
                label="Geometri Peta"
                value={`${sudahGeometri}/${totalWilayah}`}
                sub="wilayah sudah ada polygon"
                color={sudahGeometri === totalWilayah && totalWilayah > 0 ? "#22c55e" : "#f59e0b"}
              />
            </Col>
          </Row>

          {/* ── Peta ── */}
          <AdminPetaMap robData={robData} />

          {/* ── Tabel ── */}
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body className="p-3 p-md-4">
              <Row className="align-items-center g-2 mb-3">
                <Col xs={12} md="auto" className="me-md-auto">
                  <h5 className="mb-0 fw-bold">Data Wilayah Rob</h5>
                  {dataAirAt && (
                    <small className="text-muted">
                      Data pasang surut terkini: <strong>{dataAirAt} WIB</strong>
                    </small>
                  )}
                </Col>
              </Row>
              <WilayahTable data={robData} loading={loading} />
            </Card.Body>
          </Card>

        </Container>
      </main>

      {/* ── Modals ── */}
      <ModalWilayahRob
        show={showModalWilayah}
        onHide={() => setShowModalWilayah(false)}
        onDataChanged={fetchRobData}
      />
      <ModalPetaWilayah
        show={showModalPeta}
        onHide={() => setShowModalPeta(false)}
        onDataChanged={fetchRobData}
      />
    </>
  );
}