// src/components/dashboardAdmin/TideTrendCard.jsx
import TideTrendChart from "./TideTrendChart";
import TideStatsRow from "./TideStatsRow";
import EmptyState from "./EmptyState";
import s from "./dashboardStyles";

export default function TideTrendCard({ tideChartData, latestTide, onDetail }) {
  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <div style={s.cardTitleWrap}>
          <div style={{ ...s.cardIconBox, background: "#fffbeb" }}>
            <i className="ti ti-chart-line" style={{ fontSize: 14, color: "#f59e0b" }} />
          </div>
          <span style={s.cardTitle}>Tren Pasang Surut</span>
        </div>
        <span style={s.cardSubtitle}>24 jam terakhir</span>
      </div>

      {tideChartData.length === 0 ? (
        <EmptyState text="Belum ada data pasang surut untuk hari ini." />
      ) : (
        <TideTrendChart data={tideChartData} />
      )}

      <TideStatsRow tideChartData={tideChartData} latestTide={latestTide} />

      <button
        style={{ ...s.detailBtn, borderColor: "#f59e0b", color: "#f59e0b", marginTop: 14 }}
        onClick={onDetail}
      >
        Lihat grafik lengkap <i className="ti ti-arrow-right" style={{ fontSize: 11 }} />
      </button>
    </div>
  );
}