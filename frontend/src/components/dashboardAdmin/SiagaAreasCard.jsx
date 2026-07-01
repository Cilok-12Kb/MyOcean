// src/components/dashboardAdmin/SiagaAreasCard.jsx
import { getRobPotential } from "../../utils/tideHelpers";
import { robBadgeStyle } from "../../utils/dashboardHelpers";
import s from "./dashboardStyles";

export default function SiagaAreasCard({ siagaAreas, robData, onDetail }) {
  const maxRobInSiaga = siagaAreas.length ? siagaAreas[0].tinggi_rob : 1;

  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <div style={s.cardTitleWrap}>
          <div style={{ ...s.cardIconBox, background: "#fef2f2" }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: 14, color: "#ef4444" }} />
          </div>
          <span style={s.cardTitle}>Wilayah Siaga</span>
        </div>
        <span style={s.cardSubtitle}>
          {siagaAreas.length} dari {robData.length} wilayah
        </span>
      </div>

      {siagaAreas.length === 0 ? (
        <div style={s.emptyState}>
          <i className="ti ti-circle-check" style={{ fontSize: 28, color: "#16a34a" }} />
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>
            Tidak ada wilayah siaga saat ini.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {siagaAreas.map((area, i) => {
            const level = getRobPotential(area.tinggi_rob);
            const badge = robBadgeStyle(level);
            const barPct = Math.min(100, Math.round((area.tinggi_rob / maxRobInSiaga) * 100));
            return (
              <div key={area.id || i} style={s.siagaRow}>
                <div style={s.siagaRank}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.siagaName}>{area.nama_wilayah}</div>
                  <div style={s.siagaSub}>{area.tinggi_rob} m tergenang</div>
                  <div style={s.barTrack}>
                    <div
                      style={{
                        ...s.barFill,
                        width: `${barPct}%`,
                        background: badge.bar,
                      }}
                    />
                  </div>
                </div>
                <span
                  style={{
                    ...s.badge,
                    background: badge.bg,
                    color: badge.text,
                    flexShrink: 0,
                  }}
                >
                  {level}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <button
        style={{ ...s.detailBtn, borderColor: "#ef4444", color: "#ef4444", marginTop: 14 }}
        onClick={onDetail}
      >
        Lihat semua wilayah <i className="ti ti-arrow-right" style={{ fontSize: 11 }} />
      </button>
    </div>
  );
}