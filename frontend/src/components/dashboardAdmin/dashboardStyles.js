// src/components/dashboardAdmin/dashboardStyles.js

const dashboardStyles = {
  page: { minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" },
  loadWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" },
  content: { padding: "24px 28px", paddingTop: "86px", display: "flex", flexDirection: "column", gap: 16 },

  // Stat grid
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 },
  statCard: { background: "#ffffff", borderRadius: 12, padding: "16px 18px", border: "1px solid #e2e8f0" },
  statLabel: { fontSize: 11, color: "#64748b", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" },
  statVal: { fontSize: 28, fontWeight: 700, color: "#0f172a", marginTop: 10, lineHeight: 1 },

  // Monitoring — 3 card individual
  monGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 },
  monCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  monCardHeader: { display: "flex", alignItems: "center", gap: 10 },
  monCardTitle: { fontSize: 13, fontWeight: 700, color: "#0f172a", lineHeight: 1.2 },
  monCardSub: { fontSize: 10, color: "#94a3b8", marginTop: 2 },
  monItems: { display: "flex", flexDirection: "column", gap: 0, flex: 1 },
  monItemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "7px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  monItemLabel: { fontSize: 12, color: "#64748b" },
  monItemValue: { fontSize: 12, fontWeight: 600, color: "#0f172a", textAlign: "right" },

  // Tombol detail
  detailBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "6px 12px",
    borderRadius: 7,
    border: "1px solid",
    background: "transparent",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    alignSelf: "flex-start",
    transition: "background 0.15s",
  },

  // Card generik
  card: { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 20px" },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 },
  cardTitleWrap: { display: "flex", alignItems: "center", gap: 8 },
  cardIconBox: { width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardTitle: { fontSize: 13, fontWeight: 700, color: "#0f172a" },
  cardSubtitle: { fontSize: 11, color: "#94a3b8", fontWeight: 500 },

  // Bottom row
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },

  // Stat ringkas di bawah grafik
  tideStatsRow: {
    display: "flex",
    alignItems: "stretch",
    background: "#f8fafc",
    borderRadius: 8,
    border: "1px solid #f1f5f9",
    marginTop: 12,
    overflow: "hidden",
  },
  tideStat: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "8px 6px",
    gap: 3,
  },
  tideStatDivider: { width: "1px", background: "#e2e8f0", flexShrink: 0 },
  tideStatLabel: { fontSize: 10, color: "#94a3b8", textAlign: "center", lineHeight: 1.3 },
  tideStatValue: { fontSize: 13, fontWeight: 700, textAlign: "center" },

  // Empty state
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0" },

  // Siaga list
  siagaRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #f1f5f9" },
  siagaRank: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    fontWeight: 600,
    color: "#94a3b8",
    flexShrink: 0,
  },
  siagaName: { fontSize: 12, fontWeight: 600, color: "#0f172a" },
  siagaSub: { fontSize: 11, color: "#94a3b8", marginTop: 1 },
  barTrack: { height: 3, borderRadius: 2, background: "#f1f5f9", marginTop: 6, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 2, transition: "width 0.4s ease" },
  badge: { display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" },
};

export default dashboardStyles;