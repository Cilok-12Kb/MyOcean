// src/pages/Admin/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import EndminTopbar from "../../components/EndminTopbar";

export default function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role"); // ← tambah ini
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const [statsRes, alertsRes, weatherRes] = await Promise.all([
          api.get("/admin/dashboard/stats", { headers }),
          api.get("/admin/alerts?limit=5", { headers }),
          api.get("/weather/summary", { headers }),
        ]);
        setStats(statsRes.data);
        setAlerts(alertsRes.data.data ?? []);
        setWeather(weatherRes.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/MyOcean-Endmin");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [navigate]);

  const deltaText = () => {
    if (stats?.delta_air == null) return "Belum ada data";
    return `${stats.delta_air >= 0 ? "+" : ""}${stats.delta_air}cm dari kemarin`;
  };

  if (loading) {
    return (
      <div style={s.loadWrap}>
        <i className="ti ti-loader-2" style={{ fontSize: 32, color: "#0284c7", animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: 12, color: "#64748b", fontSize: 14 }}>Memuat data dashboard...</p>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={s.page}>
      {/* Topbar */}
      <EndminTopbar />

      <div style={s.content}>
        {/* Stat Cards */}
        <div style={s.statsGrid}>
          <StatCard
            label="Stasiun Aktif"
            value={stats?.stasiun_aktif ?? "-"}
            sub={`${stats?.stasiun_offline ?? 0} offline`}
            accent="#0284c7"
            accentBg="#e0f2fe"
            icon="ti-router"
          />
          <StatCard
            label="Alert Aktif"
            value={stats?.alert_aktif ?? "-"}
            sub={`${stats?.alert_bahaya ?? 0} siaga bahaya`}
            accent={stats?.alert_bahaya > 0 ? "#ef4444" : "#f59e0b"}
            accentBg={stats?.alert_bahaya > 0 ? "#fef2f2" : "#fffbeb"}
            icon="ti-bell-ringing"
          />
          <StatCard
            label="Tinggi Air Rata-rata"
            value={stats?.rata_tinggi_air != null ? `${stats.rata_tinggi_air} m` : "- m"}
            sub={deltaText()}
            accent={stats?.delta_air > 0 ? "#ef4444" : "#16a34a"}
            accentBg={stats?.delta_air > 0 ? "#fef2f2" : "#f0fdf4"}
            icon="ti-waves"
          />
          <StatCard
            label="Prediksi Rob 1 Jam"
            value={stats?.prediksi_1jam != null ? `${stats.prediksi_1jam} m` : "- m"}
            sub={`AI: ${stats?.prediksi_status ?? "memproses..."}`}
            accent="#7c3aed"
            accentBg="#f5f3ff"
            icon="ti-robot"
          />
        </div>

        {/* Row 2 */}
        <div style={s.row2}>
          {/* Alert */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardTitleWrap}>
                <div style={{ ...s.cardIconBox, background: "#fef2f2" }}>
                  <i className="ti ti-bell-ringing" style={{ fontSize: 15, color: "#ef4444" }} />
                </div>
                <span style={s.cardTitle}>Alert Terbaru</span>
              </div>
              <button style={s.linkBtn} onClick={() => navigate("/ocean-dashboard/peringatan")}>
                Lihat semua <i className="ti ti-arrow-right" style={{ fontSize: 12 }} />
              </button>
            </div>
            {alerts.length === 0 ? (
              <div style={s.emptyState}>
                <i className="ti ti-circle-check" style={{ fontSize: 28, color: "#16a34a" }} />
                <p style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>Tidak ada alert aktif.</p>
              </div>
            ) : (
              alerts.map((a) => <AlertRow key={a.id} alert={a} />)
            )}
          </div>

          {/* Cuaca */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardTitleWrap}>
                <div style={{ ...s.cardIconBox, background: "#e0f2fe" }}>
                  <i className="ti ti-cloud" style={{ fontSize: 15, color: "#0284c7" }} />
                </div>
                <span style={s.cardTitle}>Ringkasan Cuaca BMKG</span>
              </div>
              <button style={s.linkBtn} onClick={() => navigate("/ocean-dashboard/cuaca")}>
                Detail <i className="ti ti-arrow-right" style={{ fontSize: 12 }} />
              </button>
            </div>
            <div style={s.weatherGrid}>
              <WeatherItem icon="ti-temperature" label="Suhu udara" value={weather?.suhu != null ? `${weather.suhu}°C` : "-°C"} color="#ef4444" bg="#fef2f2" />
              <WeatherItem icon="ti-wind" label="Kecepatan angin" value={weather?.angin != null ? `${weather.angin} km/h` : "- km/h"} color="#0284c7" bg="#e0f2fe" />
              <WeatherItem icon="ti-droplet" label="Kelembapan" value={weather?.kelembapan != null ? `${weather.kelembapan}%` : "-%"} color="#0ea5e9" bg="#f0f9ff" />
              <WeatherItem icon="ti-waves" label="Tinggi gelombang" value={weather?.gelombang != null ? `${weather.gelombang} m` : "- m"} color="#16a34a" bg="#f0fdf4" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div style={s.cardTitleWrap}>
              <div style={{ ...s.cardIconBox, background: "#f0fdf4" }}>
                <i className="ti ti-bolt" style={{ fontSize: 15, color: "#16a34a" }} />
              </div>
              <span style={s.cardTitle}>Aksi Cepat</span>
            </div>
          </div>
          <div style={s.actionGrid}>
            {/* ── Hanya tampil untuk super_admin ── */}
            {role === "super_admin" && (
              <QuickAction
                icon="ti-users"
                label="Tambah Pengguna"
                color="#0284c7"
                bg="#e0f2fe"
                onClick={() => navigate("/ocean-dashboard/pengguna")}
              />
            )}
            <QuickAction icon="ti-alert-triangle" label="Kirim Alert Manual" color="#ef4444" bg="#fef2f2" onClick={() => navigate("/ocean-dashboard/peringatan")} />
            <QuickAction icon="ti-map-2" label="Update Peta Rob" color="#f59e0b" bg="#fffbeb" onClick={() => navigate("/ocean-dashboard/peta")} />
            <QuickAction icon="ti-download" label="Ekspor Laporan" color="#16a34a" bg="#f0fdf4" onClick={() => navigate("/ocean-dashboard/laporan")} />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function StatCard({ label, value, sub, accent, accentBg, icon }) {
  return (
    <div style={{ ...s.statCard, borderTop: `3px solid ${accent}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={s.statLabel}>{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: accentBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <i className={`ti ${icon}`} style={{ fontSize: 16, color: accent }} />
        </div>
      </div>
      <div style={s.statVal}>{value}</div>
      <div style={{ fontSize: 11, color: accent, marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>{sub}</div>
    </div>
  );
}

function AlertRow({ alert }) {
  const cfg = {
    bahaya:  { dot: "#ef4444", bg: "#fef2f2", text: "#991b1b", label: "Bahaya" },
    waspada: { dot: "#f59e0b", bg: "#fffbeb", text: "#92400e", label: "Waspada" },
    normal:  { dot: "#16a34a", bg: "#f0fdf4", text: "#166534", label: "Normal" },
  };
  const c = cfg[alert.level] ?? cfg.normal;
  return (
    <div style={s.alertRow}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{alert.lokasi}</div>
        <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>{alert.waktu} — tinggi {alert.tinggi}m</div>
      </div>
      <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 20, background: c.bg, color: c.text, fontWeight: 600, flexShrink: 0 }}>
        {c.label}
      </span>
    </div>
  );
}

function WeatherItem({ icon, label, value, color, bg }) {
  return (
    <div style={{ background: bg, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <i className={`ti ${icon}`} style={{ fontSize: 18, color }} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{value}</div>
        <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>{label}</div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, color, bg, onClick }) {
  return (
    <button onClick={onClick} style={s.actionBtn}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <i className={`ti ${icon}`} style={{ fontSize: 22, color }} />
      </div>
      <span style={{ fontSize: 12, color: "#0f172a", textAlign: "center", lineHeight: 1.3, marginTop: 2 }}>{label}</span>
    </button>
  );
}

const s = {
  page:         { minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" },
  loadWrap:     { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" },
  content:      { padding: "24px 28px", paddingTop: "90px", display: "flex", flexDirection: "column", gap: 20 },
  statsGrid:    { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 },
  statCard:     { background: "#ffffff", borderRadius: 12, padding: "16px 18px", border: "1px solid #e2e8f0" },
  statLabel:    { fontSize: 12, color: "#64748b", fontWeight: 500 },
  statVal:      { fontSize: 28, fontWeight: 700, color: "#0f172a", marginTop: 8, lineHeight: 1 },
  row2:         { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  card:         { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 20px" },
  cardHeader:   { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  cardTitleWrap:{ display: "flex", alignItems: "center", gap: 8 },
  cardIconBox:  { width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" },
  cardTitle:    { fontSize: 13, fontWeight: 700, color: "#0f172a" },
  linkBtn:      { fontSize: 12, color: "#0284c7", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 3, fontWeight: 500 },
  emptyState:   { display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0" },
  alertRow:     { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #f1f5f9" },
  weatherGrid:  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  actionGrid:   { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 },
  actionBtn:    { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 12px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transition: "border-color 0.15s" },
};