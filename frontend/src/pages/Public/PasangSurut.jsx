import { useEffect, useState } from "react";
import PublicNavbar from "../../components/PublicNavbar";
import api from "../../services/api";
import "../../styles/PasangSurut.css";

const ROB_AREAS = [
  "Tambakharjo",
  "Tawangsari",
  "Tawangmas",
  "Panggung Lor",
  "Bandarharjo",
  "Tanjung Mas",
  "Kemijen",
  "Tambakrejo",
  "Terboyo Kulon",
  "Terboyo Wetan",
  "Trimulyo",
];

const MSL_VALUE = 1.5;

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function getAreaName(item) {
  return (
    item.lokasi ||
    item.desa ||
    item.village ||
    item.kelurahan ||
    item.nama_wilayah ||
    "-"
  );
}

function getTideValue(item) {
  return Number(item.tide_height || item.kenaikan_air || 0);
}

function getRobPotential(value) {
  if (value >= 2.2) return "Tinggi";
  if (value >= 1.8) return "Sedang";
  if (value >= 1.5) return "Rendah";
  return "Tenang";
}

function formatDateTime(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTodayLabel() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// GANTI BAGIAN INI DENGAN API MODEL PREDIKSI PASANG SURUT
//-- START --//
function TideChart({ data }) {
  const chartData = data.slice(0, 24);
  const maxHeight = 3;
  const chartWidth = 1600;
  const chartHeight = 520;

  const paddingLeft = 85;
  const paddingRight = 55;
  const paddingTop = 60;
  const paddingBottom = 90;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const toY = (value) =>
    paddingTop + innerHeight - (value / maxHeight) * innerHeight;

  const points = chartData.map((item, index) => {
    const value = getTideValue(item);
    const x =
      paddingLeft +
      (index * innerWidth) / Math.max(chartData.length - 1, 1);

    const hour = String(index + 1).padStart(2, "0") + ":00";

    return {
      ...item,
      x,
      y: toY(value),
      value,
      hour,
      manual: value + 0.03,
      prediction: Math.max(value - 0.05, 0),
    };
  });

  const digitalPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const manualPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${toY(p.manual)}`)
    .join(" ");

  const predictionPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${toY(p.prediction)}`)
    .join(" ");

  return (
    <div className="analysis-chart-card">
      <div className="analysis-card-header">
        <h2>GRAFIK ANALISIS DATA</h2>
        <button type="button">UNDUH GRAFIK (PNG)</button>
      </div>

      <h1 className="analysis-chart-title">
        GRAFIK ANALISIS DATA - {getTodayLabel()}
      </h1>

      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="analysis-chart"
      >
        {[0, 0.5, 1, 1.5, 2, 2.5, 3].map((value) => {
          const y = toY(value);

          return (
            <g key={value}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                className="analysis-grid"
              />
              <text x={35} y={y + 5} className="analysis-axis-label">
                {(value * 100).toFixed(0)}
              </text>
            </g>
          );
        })}

        <line
          x1={paddingLeft}
          y1={paddingTop}
          x2={paddingLeft}
          y2={chartHeight - paddingBottom}
          className="analysis-axis-line"
        />

        <line
          x1={paddingLeft}
          y1={chartHeight - paddingBottom}
          x2={chartWidth - paddingRight}
          y2={chartHeight - paddingBottom}
          className="analysis-axis-line"
        />

        <text
          x={22}
          y={chartHeight / 2}
          transform={`rotate(-90 22 ${chartHeight / 2})`}
          className="analysis-axis-title"
        >
          Ketinggian (cm)
        </text>

        <text
          x={chartWidth / 2}
          y={chartHeight - 25}
          className="analysis-axis-title"
        >
          Periode / Jam
        </text>

        <line
          x1={paddingLeft}
          y1={toY(MSL_VALUE)}
          x2={chartWidth - paddingRight}
          y2={toY(MSL_VALUE)}
          className="msl-line"
        />

        <path d={digitalPath} className="digital-area" />
        <path d={digitalPath} className="digital-line" fill="none" />
        <path d={manualPath} className="manual-line" fill="none" />
        <path d={predictionPath} className="prediction-line" fill="none" />

        {points.map((point, index) => (
          <g key={point.id || index}>
            <circle cx={point.x} cy={point.y} r="5" className="digital-dot" />

            <text
              x={point.x}
              y={chartHeight - paddingBottom + 28}
              textAnchor="middle"
              className="analysis-x-label"
            >
              {index + 1}
            </text>
          </g>
        ))}
      </svg>

      <div className="analysis-legend">
        <span><i className="legend-digital" /> Digital</span>
        <span><i className="legend-manual" /> Manual</span>
        <span><i className="legend-prediction" /> Prediksi</span>
        <span><i className="legend-msl" /> MSL</span>
      </div>
    </div>
  );
}
//-- END --//

function TideSummarySection({ data }) {
  return (
    <section className="tide-summary-section">
      <TideChart data={data} />
    </section>
  );
}

function TideTable({ data }) {
  function exportCSV() {
    const header = [
      "No",
      "Lokasi",
      "Pasang/Surut",
      "Potensi Rob",
      "Kenaikan Air",
      "Tanggal dan Waktu",
    ];

    const rows = data.map((item, index) => {
      const value = getTideValue(item);

      return [
        index + 1,
        getAreaName(item),
        item.status,
        getRobPotential(value),
        `${value} m`,
        `${formatDateTime(item.datetime)} WIB`,
      ];
    });

    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "data-pasang-surut.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="tide-tabel-card">
      <section className="tide-table-section">
        <div className="table-title-row">
          <h1>RINCIAN INFORMASI PASANG SURUT</h1>
          <button onClick={exportCSV}>Export CSV</button>
        </div>

        <table className="tide-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Lokasi</th>
              <th>Pasang/Surut</th>
              <th>Potensi Rob</th>
              <th>Kenaikan Air</th>
              <th>Tanggal dan Waktu</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, index) => {
              const value = getTideValue(item);
              const potential = getRobPotential(value);

              return (
                <tr key={item.id || index}>
                  <td>{index + 1}</td>
                  <td>{getAreaName(item)}</td>
                  <td>{item.status}</td>
                  <td>
                    <span className={`rob-badge ${potential.toLowerCase()}`}>
                      {potential}
                    </span>
                  </td>
                  <td>{value} m</td>
                  <td>{formatDateTime(item.datetime)} WIB</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function PasangSurutContent() {
  const [tideData, setTideData] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchTideData() {
    try {
      const response = await api.get("/pasang-surut");

      console.log("DATA PASANG SURUT:", response.data.data);

      setTideData(response.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data pasang surut:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTideData();
  }, []);

  if (loading) {
    return (
      <main className="pasang-surut-page">
        Memuat data pasang surut...
      </main>
    );
  }

  return (
    <main className="pasang-surut-page">
      <TideSummarySection data={tideData} />
      <TideTable data={tideData} />
    </main>
  );
}

export default function PasangSurut() {
  return (
    <>
      <PublicNavbar />
      <PasangSurutContent />
    </>
  );
}