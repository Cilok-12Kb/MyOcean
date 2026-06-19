// src/pages/admin/PasangSurutAdmin.jsx
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import api from "../../services/api";
import "../../styles/PasangSurut.css";

import AdminNavbar from "../../components/EndminNavbar";
import EndminTopbar from "../../components/EndminTopbar";

import ModalPasangSurut from "../../components/PasangSurut/ModalPasangSurut";
import ModalWilayahRob from "../../components/PasangSurut/ModalWilayahRob";
import ModalGeneratePrediksi from "../../components/PasangSurut/ModalGeneratePrediksi";

// ── Reuse helper & komponen yang sama persis dengan halaman publik ──
const MSL_VALUE = 1.5;

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const value = String(i).padStart(2, "0") + ":00";
  const label = String(i).padStart(2, "0") + ".00";
  return { value, label };
});

function getRobPotential(tinggiRob) {
  if (tinggiRob >= 0.7) return "Tinggi";
  if (tinggiRob >= 0.4) return "Sedang";
  if (tinggiRob > 0)    return "Rendah";
  return "Tenang";
}

function formatDateLabel(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function toDateInputValue(date) {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day   = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentHourValue() {
  const now = new Date();
  return String(now.getHours()).padStart(2, "0") + ":00";
}

function formatTanggalJam(tanggal, jam) {
  if (!tanggal && jam == null) return "-";
  const date = new Date(tanggal + "T00:00:00");
  const tanggalStr = date.toLocaleDateString("id-ID", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
  return `${tanggalStr} ${String(jam).padStart(2, "0")}:00`;
}

function getRobBadgeVariant(potential) {
  switch (potential) {
    case "Tinggi": return "danger";
    case "Sedang": return "warning";
    case "Rendah": return "primary";
    default:       return "success";
  }
}

// ── Helper baru: cek apakah tanggal+jam yang dipilih ada di masa depan ──
function isFutureSelection(selectedDate, selectedHour) {
  const today = toDateInputValue(new Date());
  if (selectedDate > today) return true;
  if (selectedDate < today) return false;
  // Tanggal sama dengan hari ini → bandingkan jam
  const selectedHourNum = parseInt(String(selectedHour).split(":")[0], 10);
  const currentHourNum = new Date().getHours();
  return selectedHourNum > currentHourNum;
}

// ── Helper baru: export array data tabel ke file CSV ──
function exportTideTableToCSV(data, selectedDate, selectedHour) {
  if (!data || data.length === 0) return;

  const headers = [
    "No", "Lokasi", "Tinggi Tanah (m)", "Tinggi Air (m)",
    "Tinggi Rob (m)", "Potensi Rob", "Pasang/Surut", "Tanggal dan Waktu",
  ];

  const escapeCsv = (value) => {
    const str = value == null ? "" : String(value);
    if (/[",\n;]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = data.map((item, index) => {
    const potential = getRobPotential(item.tinggi_rob);
    return [
      index + 1,
      item.nama_wilayah,
      item.tinggi_tanah,
      item.tide_height_digital,
      item.tinggi_rob > 0 ? item.tinggi_rob : "Tidak tergenang",
      potential,
      item.status,
      `${formatTanggalJam(item.tanggal, item.jam)} WIB`,
    ].map(escapeCsv).join(",");
  });

  const csvContent = [headers.map(escapeCsv).join(","), ...rows].join("\n");
  // Tambahkan BOM agar karakter dibaca dengan benar saat dibuka di Excel
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pasang-surut_${selectedDate}_${String(selectedHour).replace(":", "")}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function PasangSurutAdmin() {
  const [chartData, setChartData] = useState([]);
  const [robData,   setRobData]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selectedDate, setSelectedDate] = useState(toDateInputValue(new Date()));
  const [selectedHour, setSelectedHour] = useState(getCurrentHourValue());

  const [showModalPasut, setShowModalPasut]       = useState(false);
  const [showModalWilayah, setShowModalWilayah]   = useState(false);
  const [showModalPrediksi, setShowModalPrediksi] = useState(false);

  async function fetchChartData(tanggal) {
    try {
      const res = await api.get("/pasang-surut", { params: { tanggal } });
      setChartData(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data grafik:", err);
    }
  }

  async function fetchRobData(tanggal, jam) {
    try {
      const res = await api.get("/pasang-surut/rob-wilayah", { params: { tanggal, jam } });
      setRobData(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data rob:", err);
    }
  }

  function refreshAll() {
    fetchChartData(selectedDate);
    fetchRobData(selectedDate, selectedHour);
  }

  useEffect(() => {
    setLoading(true);
    fetchChartData(selectedDate).finally(() => setLoading(false));
  }, [selectedDate]);

  useEffect(() => {
    fetchRobData(selectedDate, selectedHour);
  }, [selectedDate, selectedHour]);

  const dataBelumTersedia = isFutureSelection(selectedDate, selectedHour);

  return (
    <>
      <AdminNavbar />
      
      <EndminTopbar />

      <main
        className="pasang-surut-page pb-4 px-3 px-md-4"
        style={{
          background: "linear-gradient(to bottom, #f8fafc, #eef2ff)",
          paddingTop: "100px",
        }}
      >
        <Container fluid="xl">
          {/* ── Toolbar admin ── */}
          <Card className="shadow-sm border-0 rounded-4 mb-4">
            <Card.Body className="p-3">
              <Row className="g-2 align-items-center">
                <Col xs={12} md="auto" className="me-md-auto">
                  <h5 className="mb-0 fw-bold">Kelola Data Pasang Surut</h5>
                  <small className="text-muted">Input, edit, dan hapus data secara manual</small>
                </Col>
                <Col xs={12} md="auto">
                  <div className="d-flex flex-wrap gap-2">
                    <Button variant="primary" onClick={() => setShowModalPasut(true)}>
                      Kelola Pasang Surut
                    </Button>
                    <Button variant="outline-primary" onClick={() => setShowModalWilayah(true)}>
                      Kelola Wilayah Rob
                    </Button>
                    <Button variant="success" onClick={() => setShowModalPrediksi(true)}>
                      Generate Prediksi 24 Jam
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* ── Grafik & tabel (tampilan sama seperti publik) ── */}
          <TideSummarySection
            data={chartData}
            selectedDate={selectedDate}
            onDateChange={(d) => { setSelectedDate(d); setSelectedHour(getCurrentHourValue()); }}
          />

          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <Spinner animation="border" variant="primary" className="me-2" />
              <span className="text-muted">Memuat data pasang surut...</span>
            </div>
          ) : (
            <TideTable
              data={robData}
              selectedDate={selectedDate}
              selectedHour={selectedHour}
              onHourChange={setSelectedHour}
              dataBelumTersedia={dataBelumTersedia}
            />
          )}
        </Container>
      </main>

      {/* ── Modals ── */}
      <ModalPasangSurut
        show={showModalPasut}
        onHide={() => setShowModalPasut(false)}
        onDataChanged={refreshAll}
      />
      <ModalWilayahRob
        show={showModalWilayah}
        onHide={() => setShowModalWilayah(false)}
        onDataChanged={refreshAll}
      />
      <ModalGeneratePrediksi
        show={showModalPrediksi}
        onHide={() => setShowModalPrediksi(false)}
        onDataChanged={refreshAll}
      />
    </>
  );
}

// ── Komponen TideChart & TideTable disalin dari halaman publik ──
// (Idealnya ini diekstrak jadi file shared terpisah — lihat catatan di bawah)
function TideChart({ data, selectedDate, onDateChange }) {
  const chartData = data.slice(0, 24);
  const maxHeight = 3;
  const chartWidth = 1600;
  const chartHeight = 520;
  const paddingLeft = 85, paddingRight = 55, paddingTop = 60, paddingBottom = 90;
  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;
  const toY = (value) => paddingTop + innerHeight - (value / maxHeight) * innerHeight;

  const points = chartData.map((item, index) => {
    const digital = Number(item.tide_height_digital || 0);
    const manual = Number(item.tide_height_manual || digital);
    const prediction = Number(item.tide_height_prediction || digital);
    const x = paddingLeft + (index * innerWidth) / Math.max(chartData.length - 1, 1);
    const hourLabel = item.jam != null ? String(item.jam).padStart(2, "0") : String(index + 1).padStart(2, "0");
    return { ...item, x, y: toY(digital), digital, manual, prediction, hourLabel };
  });

  const digitalPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const manualPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${toY(p.manual)}`).join(" ");
  const predictionPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${toY(p.prediction)}`).join(" ");

  return (
    <Card className="shadow-sm border-0 rounded-4 analysis-chart-card">
      <Card.Body className="p-3 p-md-4">
        <Row className="align-items-center g-2 mb-3">
          <Col xs={12} md="auto" className="me-md-auto">
            <h2 className="analysis-chart-heading mb-0">GRAFIK ANALISIS DATA</h2>
          </Col>
          <Col xs={12} md="auto">
            <input
              type="date"
              className="form-control analysis-date-picker"
              value={selectedDate}
              max={toDateInputValue(new Date())}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </Col>
        </Row>

        <h1 className="analysis-chart-title text-center">
          GRAFIK ANALISIS DATA - {formatDateLabel(selectedDate)}
        </h1>

        {chartData.length === 0 ? (
          <div className="analysis-chart-empty text-center text-muted py-5">
            Tidak ada data pasang surut untuk tanggal ini.
          </div>
        ) : (
          <>
            <div className="analysis-chart-scroll">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="analysis-chart" preserveAspectRatio="xMidYMid meet">
                {[0, 0.5, 1, 1.5, 2, 2.5, 3].map((value) => {
                  const y = toY(value);
                  return (
                    <g key={value}>
                      <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} className="analysis-grid" />
                      <text x={35} y={y + 5} className="analysis-axis-label">{(value * 100).toFixed(0)}</text>
                    </g>
                  );
                })}
                <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={chartHeight - paddingBottom} className="analysis-axis-line" />
                <line x1={paddingLeft} y1={chartHeight - paddingBottom} x2={chartWidth - paddingRight} y2={chartHeight - paddingBottom} className="analysis-axis-line" />
                <text x={22} y={chartHeight / 2} transform={`rotate(-90 22 ${chartHeight / 2})`} className="analysis-axis-title">Ketinggian (cm)</text>
                <text x={chartWidth / 2} y={chartHeight - 25} className="analysis-axis-title">Periode / Jam</text>
                <line x1={paddingLeft} y1={toY(MSL_VALUE)} x2={chartWidth - paddingRight} y2={toY(MSL_VALUE)} className="msl-line" />
                <path d={digitalPath} className="digital-area" />
                <path d={digitalPath} className="digital-line" fill="none" />
                <path d={manualPath} className="manual-line" fill="none" />
                <path d={predictionPath} className="prediction-line" fill="none" />
                {points.map((point, index) => (
                  <g key={point.id || index}>
                    <circle cx={point.x} cy={point.y} r="5" className="digital-dot" />
                    <text x={point.x} y={chartHeight - paddingBottom + 28} textAnchor="middle" className="analysis-x-label">
                      {point.hourLabel}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            <Row className="analysis-legend justify-content-center g-3 g-md-4 mt-2">
              <Col xs="auto" className="d-flex align-items-center gap-2"><span className="legend-swatch legend-digital" /> Digital</Col>
              <Col xs="auto" className="d-flex align-items-center gap-2"><span className="legend-swatch legend-manual" /> Manual</Col>
              <Col xs="auto" className="d-flex align-items-center gap-2"><span className="legend-swatch legend-prediction" /> Prediksi</Col>
              <Col xs="auto" className="d-flex align-items-center gap-2"><span className="legend-swatch legend-msl" /> MSL</Col>
            </Row>
          </>
        )}
      </Card.Body>
    </Card>
  );
}

function TideSummarySection({ data, selectedDate, onDateChange }) {
  return (
    <section className="tide-summary-section mb-4">
      <TideChart data={data} selectedDate={selectedDate} onDateChange={onDateChange} />
    </section>
  );
}

function TideTable({ data, selectedDate, selectedHour, onHourChange, dataBelumTersedia }) {
  const canExport = !dataBelumTersedia && data.length > 0;

  return (
    <Card className="shadow-sm border-0 rounded-4">
      <Card.Body className="p-3 p-md-4">
        <Row className="align-items-center g-2 mb-3">
          <Col xs={12} md="auto" className="me-md-auto">
            <h1 className="tide-table-heading mb-0">RINCIAN INFORMASI PASANG SURUT</h1>
          </Col>
          <Col xs={12} md="auto">
            <div className="d-flex flex-wrap gap-2">
              <select
                className="form-select tide-hour-picker"
                value={selectedHour}
                onChange={(e) => onHourChange(e.target.value)}
              >
                {HOUR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <Button
                variant="outline-success"
                disabled={!canExport}
                onClick={() => exportTideTableToCSV(data, selectedDate, selectedHour)}
                title={canExport ? "Export data ke CSV" : "Tidak ada data untuk diekspor"}
              >
                <i className="bi bi-download me-1" />
                Export CSV
              </Button>
            </div>
          </Col>
        </Row>

        {dataBelumTersedia ? (
          <div className="tide-table-empty text-center text-muted py-5">
            <div className="fw-semibold mb-1">Data belum tersedia</div>
            <small>
              Jam {selectedHour.split(":")[0]}.00 WIB pada {formatDateLabel(selectedDate)} belum terlewati,
              data pasang surut belum tercatat untuk waktu tersebut.
            </small>
          </div>
        ) : data.length === 0 ? (
          <div className="tide-table-empty text-center text-muted py-5">Tidak ada data untuk jam ini.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover tide-table align-middle mb-0">
              <thead>
                <tr>
                  <th>#</th><th>Lokasi</th><th>Tinggi Tanah</th><th>Tinggi Air</th>
                  <th>Tinggi Rob</th><th>Potensi Rob</th><th>Pasang/Surut</th><th>Tanggal dan Waktu</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => {
                  const potential = getRobPotential(item.tinggi_rob);
                  return (
                    <tr key={item.nama_wilayah || index}>
                      <td>{index + 1}</td>
                      <td className="fw-semibold">{item.nama_wilayah}</td>
                      <td>{item.tinggi_tanah} m</td>
                      <td>{item.tide_height_digital} m</td>
                      <td>{item.tinggi_rob > 0 ? `${item.tinggi_rob} m` : "Tidak tergenang"}</td>
                      <td><span className={`badge bg-${getRobBadgeVariant(potential)} rob-badge-pill`}>{potential}</span></td>
                      <td>{item.status}</td>
                      <td className="text-nowrap">{formatTanggalJam(item.tanggal, item.jam)} WIB</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}