// src/utils/dashboardHelpers.js

export function getDominantWeather(weatherData) {
  if (!weatherData.length) return "-";
  const counts = {};
  weatherData.forEach((w) => {
    const key = w.weather_desc || w.cuaca || "-";
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

export function getLatestTide(tideChartData) {
  for (let i = tideChartData.length - 1; i >= 0; i--) {
    if (tideChartData[i].tide_height_digital != null) return tideChartData[i];
  }
  return null;
}

export function getTopRobArea(robData) {
  if (!robData.length) return null;
  return [...robData].sort((a, b) => b.tinggi_rob - a.tinggi_rob)[0];
}

export function robBadgeStyle(level) {
  switch (level) {
    case "Tinggi":
      return { bg: "#fef2f2", text: "#dc2626", bar: "#ef4444" };
    case "Sedang":
      return { bg: "#fffbeb", text: "#d97706", bar: "#f59e0b" };
    case "Rendah":
      return { bg: "#e0f2fe", text: "#0284c7", bar: "#38bdf8" };
    default:
      return { bg: "#f0fdf4", text: "#15803d", bar: "#22c55e" };
  }
}

// Smooth curve helper (Catmull-Rom → cubic Bézier), dipakai oleh TideTrendChart
export function buildSmoothPath(pts) {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0][0]} ${pts[0][1]}`;
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
}