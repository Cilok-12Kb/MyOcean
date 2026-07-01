// src/components/dashboardAdmin/MonitoringGrid.jsx
import WeatherMonitorCard from "./WeatherMonitorCard";
import TideMonitorCard from "./TideMonitorCard";
import RobMonitorCard from "./RobMonitorCard";
import s from "./dashboardStyles";

export default function MonitoringGrid({
  weatherData,
  avgTemp,
  dominantWeather,
  latestTide,
  robData,
  topRobArea,
  topRobLevel,
  onDetailCuaca,
  onDetailPasangSurut,
  onDetailPeta,
}) {
  return (
    <div style={s.monGrid}>
      <WeatherMonitorCard
        weatherData={weatherData}
        avgTemp={avgTemp}
        dominantWeather={dominantWeather}
        onDetail={onDetailCuaca}
      />
      <TideMonitorCard latestTide={latestTide} onDetail={onDetailPasangSurut} />
      <RobMonitorCard
        robData={robData}
        topRobArea={topRobArea}
        topRobLevel={topRobLevel}
        onDetail={onDetailPeta}
      />
    </div>
  );
}