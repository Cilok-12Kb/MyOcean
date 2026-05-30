// src/components/EndminTopbar.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EndminTopbar({ alerts = [] }) {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (d) =>
    d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formatDate = (d) =>
    d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div style={s.topbar}>
      <div>
        <div style={s.pageTitle}>Dashboard Overview</div>
        <div style={s.pageMeta}>{formatDate(time)} — {formatTime(time)} WIB</div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button style={s.iconBtn} onClick={() => navigate("/ocean-dashboard/peringatan")} title="Peringatan">
          <i className="ti ti-bell" style={{ fontSize: 16, color: "#e0fdf4" }} />
          {alerts.filter((a) => a.level === "bahaya").length > 0 && <span style={s.notifDot} />}
        </button>
        <button style={s.iconBtn} onClick={() => window.location.reload()} title="Refresh">
          <i className="ti ti-refresh" style={{ fontSize: 16, color: "#e0fdf4" }} />
        </button>
        <button style={s.iconBtn} onClick={() => navigate("/ocean-dashboard/profil")} title="Profil">
          <i className="ti ti-user" style={{ fontSize: 16, color: "#e0fdf4" }} />
        </button>
      </div>
    </div>
  );
}

const s = {
  topbar:    { background: "#16a34a", borderBottom: "1px solid #15803d", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "fixed", top: 0, left: 240, right:0, zIndex: 50 },
  pageTitle: { fontSize: 16, fontWeight: 700, color: "#ffffff" },
  pageMeta:  { fontSize: 12, color: "#bbf7d0", marginTop: 2 },
  iconBtn:   { width: 34, height: 34, borderRadius: 8, background: "#15803d", border: "1px solid #166534", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" },
  notifDot:  { position: "absolute", top: 6, right: 6, width: 7, height: 7, background: "#fbbf24", borderRadius: "50%", border: "2px solid #16a34a" },
};