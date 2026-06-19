import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../../components/PublicNavbar";
import WeatherMapView from "../../components/weather/WeatherMap";
import WeatherSummaryBar from "../../components/weather/WeatherSummaryBar";
import RobPotentialMap from "../../components/potensi_rob/RobPotentialMap";
import useWeatherRataRata from "../../hooks/useWeatherRataRata";
import api from "../../services/api";
import "../../styles/Dashboard.css";

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Helper rob (sesuai struktur baru: tinggi_rob, bukan tide_height) ──
function getRobPotential(tinggiRob) {
  if (tinggiRob >= 0.7) return "Tinggi";
  if (tinggiRob >= 0.4) return "Sedang";
  if (tinggiRob > 0)    return "Rendah";
  return "Tenang";
}

function getRobPotentialClass(tinggiRob) {
  if (tinggiRob >= 0.7) return "tinggi";
  if (tinggiRob >= 0.4) return "sedang";
  if (tinggiRob > 0)    return "rendah";
  return "tenang";
}

/* ── Alert Banner ── */
function RobAlertBanner({ robData }) {
  const highAlerts = robData.filter((item) => item.tinggi_rob >= 0.7);
  const medAlerts  = robData.filter(
    (item) => item.tinggi_rob >= 0.4 && item.tinggi_rob < 0.7
  );

  if (robData.length === 0) return null;

  const level =
    highAlerts.length > 0 ? "tinggi" : medAlerts.length > 0 ? "sedang" : null;

  if (!level) return null;

  const areas =
    level === "tinggi"
      ? highAlerts.map((i) => i.nama_wilayah)
      : medAlerts.map((i) => i.nama_wilayah);

  return (
    <div className={`db-alert-banner db-alert-banner--${level}`}>
      <div className="db-alert-banner__icon">
        {level === "tinggi" ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        )}
      </div>
      <div className="db-alert-banner__body">
        <span className="db-alert-banner__tag">
          {level === "tinggi" ? "SIAGA ROB TINGGI" : "WASPADA ROB SEDANG"}
        </span>
        <span className="db-alert-banner__text">
          Potensi rob terdeteksi di:{" "}
          <strong>{areas.join(", ")}</strong>. Segera lakukan langkah
          antisipasi.
        </span>
      </div>
      <div className="db-alert-banner__pulse" />
    </div>
  );
}

/* ── Summary Stats ── */
function SummaryStats({ robData, weatherData }) {
  const maxRob = robData.length
    ? Math.max(...robData.map((i) => i.tinggi_rob))
    : 0;
  const highCount = robData.filter((i) => i.tinggi_rob >= 0.7).length;
  const avgTemp = weatherData.length
    ? (weatherData.reduce((s, i) => s + Number(i.t || 0), 0) / weatherData.length).toFixed(1)
    : "-";

  const stats = [
    {
      label: "Lokasi Dipantau",
      value: robData.length || "-",
      unit: "titik",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      ),
      color: "blue",
    },
    {
      label: "Siaga Tinggi",
      value: highCount || "0",
      unit: "area",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
      color: "red",
    },
    {
      label: "Tinggi Rob Maks",
      value: maxRob.toFixed(2),
      unit: "meter",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 12h20M2 6c1.5 2 3 3 5 3s3.5-1 5-3 3.5-3 5-3M2 18c1.5 2 3 3 5 3s3.5-1 5-3 3.5-3 5-3"/>
        </svg>
      ),
      color: "amber",
    },
    {
      label: "Suhu Rata-rata",
      value: avgTemp,
      unit: "°C",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z"/>
        </svg>
      ),
      color: "green",
    },
  ];

  return (
    <div className="db-stats-grid">
      {stats.map((s, i) => (
        <div key={i} className={`db-stat-card db-stat-card--${s.color}`}>
          <div className={`db-stat-card__icon db-stat-card__icon--${s.color}`}>
            {s.icon}
          </div>
          <div className="db-stat-card__body">
            <div className="db-stat-card__label">{s.label}</div>
            <div className="db-stat-card__value">
              {s.value}
              <span className="db-stat-card__unit">{s.unit}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Section Header ── */
function SectionHeader({ icon, title, subtitle, linkTo, linkLabel }) {
  const navigate = useNavigate();
  return (
    <div className="db-section-header">
      <div className="db-section-header__left">
        <div className="db-section-header__icon">{icon}</div>
        <div>
          <div className="db-section-header__title">{title}</div>
          {subtitle && (
            <div className="db-section-header__subtitle">{subtitle}</div>
          )}
        </div>
      </div>
      {linkTo && (
        <button
          className="db-detail-btn"
          onClick={() => navigate(linkTo)}
        >
          {linkLabel || "Lihat Detail"}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      )}
    </div>
  );
}

/* ── Weather Summary Card ── */
function WeatherSummaryCard({ weather, onSelect, isSelected }) {
  const temp = weather?.t ?? "-";
  const humidity = weather?.hu ?? "-";
  const windSpeed = weather?.ws ?? "-";
  const desc = weather?.weather_desc ?? weather?.cuaca ?? "Cerah Berawan";
  const location = weather?.desa || "Semarang";

  return (
    <div
      className={`db-weather-mini ${isSelected ? "db-weather-mini--active" : ""}`}
      onClick={() => onSelect && onSelect(weather)}
    >
      <div className="db-weather-mini__temp">{temp}°</div>
      <div className="db-weather-mini__info">
        <div className="db-weather-mini__loc">{location}</div>
        <div className="db-weather-mini__desc">{desc}</div>
        <div className="db-weather-mini__stats">
          <span>{humidity}% RH</span>
          <span>{windSpeed} km/j</span>
        </div>
      </div>
    </div>
  );
}

/* ── Weather Section ── */
function WeatherSection({
  selectedWeather,
  setSelectedWeather,
  filteredCuaca,
  loading,
  countdown,
  rata,
  loadingRata,
}) {
  const [slideIndex, setSlideIndex] = useState(0);

  // Reset slide index kalau data cuaca berubah (misal abis fetch ulang)
  useEffect(() => {
    setSlideIndex(0);
  }, [filteredCuaca.length]);

  // Auto-slide tiap 3 detik
  useEffect(() => {
    if (filteredCuaca.length <= 1) return;

    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % filteredCuaca.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [filteredCuaca.length]);

  const current = filteredCuaca[slideIndex] || selectedWeather;

  function goPrev() {
    setSlideIndex((prev) =>
      prev === 0 ? filteredCuaca.length - 1 : prev - 1
    );
  }

  function goNext() {
    setSlideIndex((prev) => (prev + 1) % filteredCuaca.length);
  }

  return (
    <div className="db-card">
      <SectionHeader
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.5 19H9a7 7 0 116.71-9h1.79a4.5 4.5 0 010 9z"/>
          </svg>
        }
        title="Data Cuaca Semarang"
        subtitle={`Sinkronisasi realtime · update ${countdown}d`}
        linkTo="/cuaca"
        linkLabel="Semua Data Cuaca"
      />

      <WeatherSummaryBar rata={rata} loading={loadingRata} />

      <div className="db-weather-map-wrap">
        <WeatherMapView
          filteredCuaca={filteredCuaca}
          loading={loading}
          countdown={countdown}
          onWeatherSelect={setSelectedWeather}
          showFilters={false}
        />
      </div>

      <div className="db-weather-slider">
        <button
          type="button"
          className="db-weather-slider__nav db-weather-slider__nav--prev"
          onClick={goPrev}
          aria-label="Kelurahan sebelumnya"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        <div className="db-weather-main-card">
          <div className="db-weather-main-card__bg" />
          <div className="db-weather-main-card__content">
            <div className="db-weather-main-card__loc">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {current?.desa || "Semarang"}
            </div>
            <div className="db-weather-main-card__temp">
              {current?.t ?? "-"}°
            </div>
            <div className="db-weather-main-card__desc">
              {current?.weather_desc ?? current?.cuaca ?? "Cerah Berawan"}
            </div>
            <div className="db-weather-main-card__row">
              <span>💧 {current?.hu ?? "-"}%</span>
              <span>🌬 {current?.ws ?? "-"} km/j</span>
              <span>🕐 {formatTime(current?.local_datetime)}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="db-weather-slider__nav db-weather-slider__nav--next"
          onClick={goNext}
          aria-label="Kelurahan berikutnya"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      {filteredCuaca.length > 1 && (
        <div className="db-weather-slider__dots">
          {filteredCuaca.map((_, i) => (
            <span
              key={i}
              className={`db-weather-slider__dot ${i === slideIndex ? "db-weather-slider__dot--active" : ""}`}
              onClick={() => setSlideIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Tide Section (sesuai struktur baru: rob per wilayah) ── */
function TideSection({ data }) {
  const sorted = [...data].sort((a, b) => b.tinggi_rob - a.tinggi_rob);
  const preview = sorted.slice(0, 6);

  return (
    <div className="db-card">
      <SectionHeader
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12h20M2 6c1.5 2 3 3 5 3s3.5-1 5-3 3.5-3 5-3M2 18c1.5 2 3 3 5 3s3.5-1 5-3 3.5-3 5-3"/>
          </svg>
        }
        title="Data Pasang Surut"
        subtitle="Potensi rob 11 kelurahan pesisir"
        linkTo="/pasang-surut"
        linkLabel="Detail Pasang Surut"
      />

      {data.length === 0 ? (
        <div className="db-empty">Data pasang surut belum tersedia.</div>
      ) : (
        <div className="db-tide-table-wrap">
          <table className="db-tide-table">
            <thead>
              <tr>
                <th>Lokasi</th>
                <th>Status</th>
                <th>Potensi Rob</th>
                <th>Tinggi Rob</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((item, index) => {
                const potential = getRobPotential(item.tinggi_rob);
                const cls = getRobPotentialClass(item.tinggi_rob);
                return (
                  <tr key={item.nama_wilayah || index}>
                    <td className="db-tide-table__loc">
                      {item.nama_wilayah}
                    </td>
                    <td>
                      <span className={`db-status-pill db-status-pill--${normalizeText(item.status || "")}`}>
                        {item.status || "-"}
                      </span>
                    </td>
                    <td>
                      <span className={`db-rob-badge db-rob-badge--${cls}`}>
                        {potential}
                      </span>
                    </td>
                    <td className="db-tide-table__val">
                      <span className={`db-tide-val db-tide-val--${cls}`}>
                        {item.tinggi_rob > 0
                          ? `${item.tinggi_rob.toFixed(2)} m`
                          : "Tidak tergenang"}
                      </span>
                    </td>
                    <td className="db-tide-table__time">
                      {formatDateTime(item.datetime)} WIB
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sorted.length > 6 && (
            <div className="db-table-overflow-hint">
              +{sorted.length - 6} lokasi lainnya · klik "Detail Pasang Surut"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Rob Map Section ── */
function RobMapSection({ data }) {
  const highCount = data.filter((i) => i.tinggi_rob >= 0.7).length;
  const medCount  = data.filter((i) => i.tinggi_rob >= 0.4 && i.tinggi_rob < 0.7).length;
  const lowCount  = data.filter((i) => i.tinggi_rob > 0 && i.tinggi_rob < 0.4).length;
  const safeCount = data.filter((i) => i.tinggi_rob <= 0).length;

  return (
    <div className="db-card">
      <SectionHeader
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
        }
        title="Peta Potensi Rob"
        subtitle="Sebaran titik terdampak di Semarang"
        linkTo="/peta"
        linkLabel="Buka Peta Lengkap"
      />

      <div className="db-rob-layout">
        <div className="db-rob-legend">
          <div className="db-rob-legend__title">Ringkasan Sebaran</div>
          {[
            { label: "Tinggi", count: highCount, cls: "tinggi" },
            { label: "Sedang", count: medCount, cls: "sedang" },
            { label: "Rendah", count: lowCount, cls: "rendah" },
            { label: "Tenang", count: safeCount, cls: "tenang" },
          ].map((item) => (
            <div key={item.cls} className="db-rob-legend__row">
              <span className={`db-rob-legend__dot db-rob-legend__dot--${item.cls}`} />
              <span className="db-rob-legend__label">{item.label}</span>
              <span className="db-rob-legend__count">{item.count} lokasi</span>
            </div>
          ))}
          <div className="db-rob-legend__divider" />
          <div className="db-rob-legend__note">
            Data diperbarui setiap 60 detik dari sensor BMKG
          </div>
        </div>

        <div className="db-rob-map-wrap">
          <RobPotentialMap locations={data} height="320px" />
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard Content ── */
function DashboardContent() {
  const [selectedWeather, setSelectedWeather] = useState(null);
  const [weatherData, setWeatherData] = useState([]);
  const [robData, setRobData] = useState([]);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [countdown, setCountdown] = useState(60);

  const { rata, loading: loadingRata } = useWeatherRataRata();

  async function fetchWeather() {
    try {
      const response = await api.get("/cuaca-semarang");
      const data = response.data.data || [];
      setWeatherData(data);
      if (!selectedWeather && data.length > 0) {
        setSelectedWeather(data[0]);
      }
    } catch (error) {
      console.error("Gagal mengambil data cuaca:", error);
    } finally {
      setLoadingWeather(false);
    }
  }

  async function fetchRobData() {
    try {
      const response = await api.get("/pasang-surut/rob-wilayah");
      setRobData(response.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data pasang surut:", error);
    }
  }

  useEffect(() => {
    fetchWeather();
    fetchRobData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchWeather();
          fetchRobData();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="db-page">
      <div className="db-page-header">
        <div>
          <div className="db-page-header__eyebrow">Dashboard BMKG</div>
          <h1 className="db-page-header__title">
            Informasi Cuaca &amp; Potensi Rob
            <span className="db-page-header__place"> Semarang</span>
          </h1>
          <div className="db-page-header__date">{dateStr}</div>
        </div>
        <div className="db-live-badge">
          <span className="db-live-badge__dot" />
          Realtime aktif
        </div>
      </div>

      <RobAlertBanner robData={robData} />
      <SummaryStats robData={robData} weatherData={weatherData} />

      <WeatherSection
        selectedWeather={selectedWeather || weatherData?.[0]}
        setSelectedWeather={setSelectedWeather}
        filteredCuaca={weatherData}
        loading={loadingWeather}
        countdown={countdown}
        rata={rata}
        loadingRata={loadingRata}
      />

      <div className="db-bottom-grid">
        <TideSection data={robData} />
        <RobMapSection data={robData} />
      </div>
    </main>
  );
}

export default function Dashboard() {
  return (
    <>
      <PublicNavbar />
      <DashboardContent />
    </>
  );
}