// src/components/PasangSurut/TideChart.jsx
import { useState, useRef } from "react";
import { Card, Row, Col, Form } from "react-bootstrap";
import { MSL_VALUE, formatDateLabel, toDateInputValue } from "../../utils/tideHelpers";

// Sumbu Y: 0 sampai 250 cm, kelipatan 20
const Y_MAX_CM   = 250;
const Y_TICKS_CM = Array.from({ length: Math.floor(Y_MAX_CM / 20) + 1 }, (_, i) => i * 20);
// [0, 20, 40, ..., 240] — kita render sampai 250 sebagai batas atas

export default function TideChart({ data, selectedDate, onDateChange }) {
  const chartData = data.slice(0, 24);

  const chartWidth    = 1600;
  const chartHeight   = 560;
  const paddingLeft   = 90;
  const paddingRight  = 55;
  const paddingTop    = 60;
  const paddingBottom = 90;

  const innerWidth  = chartWidth  - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop  - paddingBottom;

  // Konversi meter → cm, lalu ke koordinat Y SVG
  const toY = (valueMeter) => {
    const valueCm = valueMeter * 100;
    return paddingTop + innerHeight - (valueCm / Y_MAX_CM) * innerHeight;
  };

  // State tooltip
  const [tooltip, setTooltip] = useState(null); // { x, y, point }
  const svgRef = useRef(null);

  const points = chartData.map((item, index) => {
    const digital    = Number(item.tide_height_digital    || 0);
    const manual     = Number(item.tide_height_manual     || digital);
    const prediction = Number(item.tide_height_prediction || digital);

    const x = paddingLeft + (index * innerWidth) / Math.max(chartData.length - 1, 1);
    const hourLabel = item.jam != null
      ? String(item.jam).padStart(2, "0")
      : String(index + 1).padStart(2, "0");

    return { ...item, x, y: toY(digital), digital, manual, prediction, hourLabel };
  });

  const digitalPath    = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const manualPath     = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${toY(p.manual)}`).join(" ");
  const predictionPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${toY(p.prediction)}`).join(" ");

  // Hitung posisi tooltip agar tidak keluar area SVG
  function getTooltipPos(px) {
    // Tooltip lebar ~170px dalam koordinat SVG (~170/chartWidth * 100%)
    // Kalau titik di kanan, tampilkan tooltip ke kiri
    const tooltipW = 185;
    const tooltipX = px + tooltipW > chartWidth - paddingRight
      ? px - tooltipW - 10
      : px + 14;
    return tooltipX;
  }

  function handleMouseEnter(point) {
    setTooltip(point);
  }

  function handleMouseLeave() {
    setTooltip(null);
  }

  return (
    <Card className="shadow-sm border-0 rounded-4 analysis-chart-card">
      <Card.Body className="p-3 p-md-4">
        <Row className="align-items-center g-2 mb-3">
          <Col xs={12} md="auto" className="me-md-auto">
            <h2 className="analysis-chart-heading mb-0">GRAFIK ANALISIS DATA</h2>
          </Col>
          <Col xs={12} md="auto">
            <Form.Control
              type="date"
              className="analysis-date-picker"
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
              <svg
                ref={svgRef}
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="analysis-chart"
                preserveAspectRatio="xMidYMid meet"
                style={{ overflow: "visible" }}
              >
                {/* ── defs (filter shadow) — didefinisikan SEKALI saja, bukan per titik ── */}
                <defs>
                  <filter id="tooltip-shadow" x="-10%" y="-10%" width="120%" height="130%">
                    <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#00000022" />
                  </filter>
                </defs>

                {/* ── Grid & label sumbu Y (kelipatan 20, 0-250 cm) ── */}
                {Y_TICKS_CM.map((cmVal) => {
                  const y = toY(cmVal / 100);
                  return (
                    <g key={cmVal}>
                      <line
                        x1={paddingLeft} y1={y}
                        x2={chartWidth - paddingRight} y2={y}
                        className="analysis-grid"
                      />
                      <text x={35} y={y + 5} className="analysis-axis-label">
                        {cmVal}
                      </text>
                    </g>
                  );
                })}

                {/* ── Garis batas 250 cm (atas) ── */}
                <line
                  x1={paddingLeft} y1={paddingTop}
                  x2={chartWidth - paddingRight} y2={paddingTop}
                  stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4,4"
                />
                <text x={35} y={paddingTop + 5} className="analysis-axis-label">250</text>

                {/* ── Sumbu ── */}
                <line
                  x1={paddingLeft} y1={paddingTop}
                  x2={paddingLeft} y2={chartHeight - paddingBottom}
                  className="analysis-axis-line"
                />
                <line
                  x1={paddingLeft} y1={chartHeight - paddingBottom}
                  x2={chartWidth - paddingRight} y2={chartHeight - paddingBottom}
                  className="analysis-axis-line"
                />

                {/* ── Label sumbu ── */}
                <text
                  x={22} y={chartHeight / 2}
                  transform={`rotate(-90 22 ${chartHeight / 2})`}
                  className="analysis-axis-title"
                >
                  Ketinggian (cm)
                </text>
                <text x={chartWidth / 2} y={chartHeight - 25} className="analysis-axis-title">
                  Periode / Jam
                </text>

                {/* ── Garis MSL ── */}
                <line
                  x1={paddingLeft} y1={toY(MSL_VALUE)}
                  x2={chartWidth - paddingRight} y2={toY(MSL_VALUE)}
                  className="msl-line"
                />

                {/* ── Area & garis data ── */}
                <path d={digitalPath}    className="digital-area" />
                <path d={digitalPath}    className="digital-line"    fill="none" />
                <path d={manualPath}     className="manual-line"     fill="none" />
                <path d={predictionPath} className="prediction-line" fill="none" />

                {/* ── Titik interaktif ── */}
                {points.map((point, index) => (
                  <g key={point.id || index}>
                    {/* Hitarea transparan lebih besar untuk mudah di-hover */}
                    <circle
                      cx={point.x} cy={point.y} r="14"
                      fill="transparent"
                      onMouseEnter={() => handleMouseEnter(point)}
                      onMouseLeave={handleMouseLeave}
                      style={{ cursor: "crosshair" }}
                    />
                    {/* Dot tampak */}
                    <circle
                      cx={point.x} cy={point.y} r="5"
                      className="digital-dot"
                      style={{ pointerEvents: "none" }}
                    />
                    {/* Label jam di sumbu X */}
                    <text
                      x={point.x}
                      y={chartHeight - paddingBottom + 28}
                      textAnchor="middle"
                      className="analysis-x-label"
                    >
                      {point.hourLabel}
                    </text>
                  </g>
                ))}

                {/* ── Tooltip — dirender TERAKHIR, di luar loop titik,
                     supaya selalu jadi elemen teratas dan tidak ketutupan
                     dot/label titik-titik berikutnya ── */}
                {tooltip && (() => {
                  const point = tooltip;
                  const tx = getTooltipPos(point.x);
                  const ty = Math.max(point.y - 10, paddingTop + 10);
                  const rows = [
                    { label: "Digital",  value: `${(point.digital * 100).toFixed(0)} cm`,    color: "#10b981" },
                    { label: "Manual",   value: `${(point.manual * 100).toFixed(0)} cm`,     color: "#3b82f6" },
                    { label: "Prediksi", value: `${(point.prediction * 100).toFixed(0)} cm`, color: "#f59e0b" },
                    { label: "MSL",      value: `${(MSL_VALUE * 100).toFixed(0)} cm`,        color: "#ef4444" },
                  ];
                  const tooltipH = 20 + rows.length * 24 + 8;
                  const tooltipW = 180;

                  return (
                    <g style={{ pointerEvents: "none" }}>
                      {/* Garis vertikal */}
                      <line
                        x1={point.x} y1={paddingTop}
                        x2={point.x} y2={chartHeight - paddingBottom}
                        stroke="#94a3b8" strokeWidth="1.5"
                        strokeDasharray="5,3"
                      />
                      {/* Kotak tooltip */}
                      <rect
                        x={tx} y={ty - 4}
                        width={tooltipW} height={tooltipH}
                        rx={8} ry={8}
                        fill="white"
                        stroke="#e2e8f0"
                        strokeWidth="1.5"
                        filter="url(#tooltip-shadow)"
                      />
                      {/* Header jam */}
                      <text
                        x={tx + tooltipW / 2} y={ty + 16}
                        textAnchor="middle"
                        fontSize="14"
                        fontWeight="700"
                        fill="#0f172a"
                      >
                        {point.hourLabel}
                      </text>
                      {/* Baris data */}
                      {rows.map((row, ri) => (
                        <g key={row.label}>
                          {/* Warna indikator */}
                          <rect
                            x={tx + 12} y={ty + 28 + ri * 24 - 8}
                            width={12} height={12}
                            rx={3} fill={row.color}
                          />
                          {/* Label */}
                          <text
                            x={tx + 30} y={ty + 28 + ri * 24}
                            fontSize="13" fill="#475569"
                          >
                            {row.label}:
                          </text>
                          {/* Nilai */}
                          <text
                            x={tx + tooltipW - 12} y={ty + 28 + ri * 24}
                            textAnchor="end"
                            fontSize="13"
                            fontWeight="600"
                            fill="#0f172a"
                          >
                            {row.value}
                          </text>
                        </g>
                      ))}
                    </g>
                  );
                })()}
              </svg>
            </div>

            <Row className="analysis-legend justify-content-center g-3 g-md-4 mt-2">
              <Col xs="auto" className="d-flex align-items-center gap-2">
                <span className="legend-swatch legend-digital" /> Digital
              </Col>
              <Col xs="auto" className="d-flex align-items-center gap-2">
                <span className="legend-swatch legend-manual" /> Manual
              </Col>
              <Col xs="auto" className="d-flex align-items-center gap-2">
                <span className="legend-swatch legend-prediction" /> Prediksi
              </Col>
              <Col xs="auto" className="d-flex align-items-center gap-2">
                <span className="legend-swatch legend-msl" /> MSL
              </Col>
            </Row>
          </>
        )}
      </Card.Body>
    </Card>
  );
}