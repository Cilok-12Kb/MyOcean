// src/pages/Admin/Dashboard.jsx
import { useNavigate } from "react-router-dom";
import EndminTopbar from "../../components/EndminTopbar";
import useDashboardData from "../../hooks/useDashboardData";
import { getRobPotential } from "../../utils/tideHelpers";

import {
  StatsGrid,
  MonitoringGrid,
  TideTrendCard,
  SiagaAreasCard,
  dashboardStyles as s,
  getDominantWeather,
  getLatestTide,
  getTopRobArea,
} from "../../components/dashboardAdmin";

const ROUTE_CUACA = "/ocean-dashboard/cuaca";
const ROUTE_PASANG_SURUT = "/ocean-dashboard/pasang-surut";
const ROUTE_PETA = "/ocean-dashboard/peta";

export default function Dashboard() {
  const navigate = useNavigate();

  const { weatherData, robData, loadingWeather, countdown, tideChartData } = useDashboardData();

  const maxRob = robData.length ? Math.max(...robData.map((i) => i.tinggi_rob)) : 0;
  const highCount = robData.filter((i) => i.tinggi_rob >= 0.7).length;
  const avgTemp = weatherData.length
    ? (weatherData.reduce((sum, i) => sum + Number(i.t || 0), 0) / weatherData.length).toFixed(1)
    : null;

  const dominantWeather = getDominantWeather(weatherData);
  const latestTide = getLatestTide(tideChartData);
  const topRobArea = getTopRobArea(robData);
  const topRobLevel = topRobArea ? getRobPotential(topRobArea.tinggi_rob) : null;

  const siagaAreas = [...robData]
    .filter((r) => r.tinggi_rob > 0)
    .sort((a, b) => b.tinggi_rob - a.tinggi_rob)
    .slice(0, 5);

  if (loadingWeather) {
    return (
      <div style={s.loadWrap}>
        <i
          className="ti ti-loader-2"
          style={{ fontSize: 32, color: "#0284c7", animation: "spin 1s linear infinite" }}
        />
        <p style={{ marginTop: 12, color: "#64748b", fontSize: 14 }}>Memuat data dashboard...</p>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <EndminTopbar />

      <div style={s.content}>
        <StatsGrid
          robData={robData}
          highCount={highCount}
          maxRob={maxRob}
          avgTemp={avgTemp}
          weatherData={weatherData}
        />

        <MonitoringGrid
          weatherData={weatherData}
          avgTemp={avgTemp}
          dominantWeather={dominantWeather}
          latestTide={latestTide}
          robData={robData}
          topRobArea={topRobArea}
          topRobLevel={topRobLevel}
          onDetailCuaca={() => navigate(ROUTE_CUACA)}
          onDetailPasangSurut={() => navigate(ROUTE_PASANG_SURUT)}
          onDetailPeta={() => navigate(ROUTE_PETA)}
        />

        <div style={s.row2}>
          <TideTrendCard
            tideChartData={tideChartData}
            latestTide={latestTide}
            onDetail={() => navigate(ROUTE_PASANG_SURUT)}
          />
          <SiagaAreasCard
            siagaAreas={siagaAreas}
            robData={robData}
            onDetail={() => navigate(ROUTE_PETA)}
          />
        </div>
      </div>
    </div>
  );
}