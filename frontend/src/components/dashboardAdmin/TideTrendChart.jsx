// src/components/dashboardAdmin/TideTrendChart.jsx
import { useState, useId } from "react";
import { Waves } from "lucide-react";
import { buildSmoothPath } from "../../utils/dashboardHelpers";

export default function TideTrendChart({ data }) {
  const rawId = useId();
  const uid = rawId.replace(/[:]/g, "");
  const [hoverIdx, setHoverIdx] = useState(null);

  const W = 560,
    H = 170;
  const PAD_L = 34,
    PAD_R = 10,
    PAD_T = 24,
    PAD_B = 22;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;
  const baseline = PAD_T + plotH;
  const denom = Math.max(data.slice(0, 24).length - 1, 1);

  const points = data.slice(0, 24);

  // Only real readings — future/empty hours are not forced to 0
  const valid = points
    .map((p, i) => ({ i, jam: p.jam, h: p.tide_height_digital, status: p.status }))
    .filter((p) => p.h != null);

  if (valid.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 0" }}>
        <Waves size={26} color="#cbd5e1" />
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>
          Data pasang surut belum tersedia.
        </p>
      </div>
    );
  }

  const cmValues = valid.map((p) => Number(p.h) * 100);
  const maxVal = Math.max(...cmValues);
  const minVal = Math.min(...cmValues);
  const pad = (maxVal - minVal) * 0.2 || 12;
  const yTop = maxVal + pad;
  const yBot = Math.max(0, minVal - pad);
  const yRange = yTop - yBot || 1;

  function toXY(i, cmVal) {
    const x = PAD_L + (i / denom) * plotW;
    const y = PAD_T + plotH - ((cmVal - yBot) / yRange) * plotH;
    return [x, y];
  }

  const xyPoints = valid.map((p) => toXY(p.i, Number(p.h) * 100));
  const linePath = buildSmoothPath(xyPoints);
  const areaPath = `${linePath} L ${xyPoints[xyPoints.length - 1][0].toFixed(2)} ${baseline} L ${xyPoints[0][0].toFixed(2)} ${baseline} Z`;

  const peakLocalIdx = cmValues.indexOf(maxVal);
  const troughLocalIdx = cmValues.indexOf(minVal);
  const lastLocalIdx = valid.length - 1;
  const lastXY = xyPoints[lastLocalIdx];
  const lastOriginalIdx = valid[lastLocalIdx].i;
  const hasFuture = lastOriginalIdx < points.length - 1;

  const gridLines = Array.from({ length: 4 }, (_, k) => {
    const val = yBot + (k / 3) * yRange;
    const [, gy] = toXY(0, val);
    return { y: gy, label: Math.round(val) };
  });

  const xTicks = [0, 6, 12, 18, 23].map((h) => {
    const idx = Math.min(h, points.length - 1);
    const [tx] = toXY(idx, 0);
    return { x: tx, label: `${String(h).padStart(2, "0")}:00` };
  });

  const hovered = hoverIdx != null ? valid[hoverIdx] : null;
  const hoverXY = hovered ? toXY(hovered.i, Number(hovered.h) * 100) : null;

  function handleMove(e) {
    const svg = e.currentTarget.ownerSVGElement;
    const rect = svg.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * W;
    let nearest = 0,
      best = Infinity;
    xyPoints.forEach(([x], idx) => {
      const d = Math.abs(x - relX);
      if (d < best) {
        best = d;
        nearest = idx;
      }
    });
    setHoverIdx(nearest);
  }

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: 180, display: "block", overflow: "visible" }}
        preserveAspectRatio="xMidYMid meet"
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id={`grad-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.32" />
            <stop offset="55%" stopColor="#fbbf24" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </linearGradient>
          <clipPath id={`clip-${uid}`}>
            <rect x={PAD_L} y={PAD_T - 4} width={plotW} height={plotH + 4} />
          </clipPath>
        </defs>

        <text x={PAD_L} y={13} fontSize="9" fill="#cbd5e1" textAnchor="start">
          cm
        </text>

        {gridLines.map((g, k) => (
          <g key={k}>
            <line
              x1={PAD_L}
              y1={g.y}
              x2={W - PAD_R}
              y2={g.y}
              stroke={k === 0 ? "#e2e8f0" : "#f1f5f9"}
              strokeWidth={k === 0 ? 1 : 0.75}
              strokeDasharray={k === 0 ? "0" : "3,3"}
            />
            <text x={PAD_L - 6} y={g.y + 3} fontSize="9" fill="#94a3b8" textAnchor="end">
              {g.label}
            </text>
          </g>
        ))}

        {xTicks.slice(1, -1).map((t, k) => (
          <line
            key={k}
            x1={t.x}
            y1={PAD_T}
            x2={t.x}
            y2={baseline}
            stroke="#f1f5f9"
            strokeWidth="0.75"
            strokeDasharray="2,4"
          />
        ))}

        {hasFuture && lastXY[0] < W - PAD_R - 36 && (
          <text
            x={(lastXY[0] + (W - PAD_R)) / 2}
            y={baseline - 6}
            fontSize="9"
            fill="#cbd5e1"
            textAnchor="middle"
            fontStyle="italic"
          >
            menunggu data
          </text>
        )}

        <g clipPath={`url(#clip-${uid})`}>
          <path d={areaPath} fill={`url(#grad-${uid})`} />
          <path
            d={linePath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            className={`tide-draw-${uid}`}
          />
        </g>

        {/* Trough marker */}
        <circle cx={xyPoints[troughLocalIdx][0]} cy={xyPoints[troughLocalIdx][1]} r="3.5" fill="#fff" stroke="#0ea5e9" strokeWidth="2" />

        {/* Peak marker */}
        {peakLocalIdx !== troughLocalIdx && (
          <circle cx={xyPoints[peakLocalIdx][0]} cy={xyPoints[peakLocalIdx][1]} r="3.5" fill="#fff" stroke="#f59e0b" strokeWidth="2" />
        )}

        {/* "Now" pulse marker */}
        {lastLocalIdx !== peakLocalIdx && lastLocalIdx !== troughLocalIdx && (
          <g>
            <circle cx={lastXY[0]} cy={lastXY[1]} r="5" fill="#f59e0b" opacity="0.45" className={`tide-pulse-${uid}`} />
            <circle cx={lastXY[0]} cy={lastXY[1]} r="3.5" fill="#f59e0b" stroke="#fff" strokeWidth="1.5" />
          </g>
        )}

        {/* Hover crosshair */}
        {hoverXY && (
          <g>
            <line x1={hoverXY[0]} y1={PAD_T} x2={hoverXY[0]} y2={baseline} stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />
            <circle cx={hoverXY[0]} cy={hoverXY[1]} r="4.5" fill="#fff" stroke="#0f172a" strokeWidth="2" />
          </g>
        )}

        {/* X-axis labels */}
        {xTicks.map((t, k) => (
          <text key={k} x={t.x} y={H - 6} fontSize="9" fill="#94a3b8" textAnchor="middle">
            {t.label}
          </text>
        ))}

        {/* Invisible hit area for hover */}
        <rect x={PAD_L} y={PAD_T - 8} width={plotW} height={plotH + 16} fill="transparent" onMouseMove={handleMove} />
      </svg>

      {/* Floating tooltip */}
      {hovered && hoverXY && (
        <div
          style={{
            position: "absolute",
            left: `${(hoverXY[0] / W) * 100}%`,
            top: `${(hoverXY[1] / H) * 100}%`,
            transform: "translate(-50%, -135%)",
            background: "#0f172a",
            color: "#fff",
            padding: "5px 9px",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            boxShadow: "0 4px 10px rgba(15,23,42,0.25)",
            zIndex: 10,
          }}
        >
          {String(hovered.jam).padStart(2, "0")}:00 · {Math.round(Number(hovered.h) * 100)} cm
        </div>
      )}

      <style>{`
        .tide-draw-${uid} {
          animation: tideDraw-${uid} 1.1s ease-out forwards;
        }
        @keyframes tideDraw-${uid} {
          from { stroke-dashoffset: 1; }
          to   { stroke-dashoffset: 0; }
        }
        .tide-pulse-${uid} {
          transform-box: fill-box;
          transform-origin: center;
          animation: tidePulse-${uid} 2s ease-out infinite;
        }
        @keyframes tidePulse-${uid} {
          0%   { transform: scale(0.6); opacity: 0.55; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tide-draw-${uid}  { animation: none; stroke-dashoffset: 0; }
          .tide-pulse-${uid} { animation: none; opacity: 0; }
        }
      `}</style>
    </div>
  );
}