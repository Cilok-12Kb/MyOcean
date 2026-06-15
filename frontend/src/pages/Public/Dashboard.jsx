import { useEffect, useMemo, useState } from "react";
import PublicNavbar from "../../components/PublicNavbar";
import WeatherMapView from "../../components/weather/WeatherMap";
import RobPotentialMap from "../../components/potensi_rob/RobPotentialMap";
import api from "../../services/api";
import "../../styles/Dashboard.css";

const ROB_AREAS = [
  "Tambakharjo",
  "Tawangsari",
  "Tawangmas",
  "Panggung Lor",
  "Bandarharjo",
  "Tanjung Mas",
  "Kemijen",
  "Tambakrejo",
  "Terboyo Kulon",
  "Terboyo Wetan",
  "Trimulyo",
];

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

function getAreaName(item) {
  return item.lokasi || item.desa || item.kelurahan || "-";
}

function getTideValue(item) {
  return Number(item.tide_height || item.kenaikan_air || 0);
}

function getRobPotential(value) {
  if (value >= 2.2) return "Tinggi";
  if (value >= 1.8) return "Sedang";
  if (value >= 1.5) return "Rendah";
  return "Tenang";
}

function WeatherCard({ weather }) {
  const temp = weather?.t ?? "-";
  const humidity = weather?.hu ?? "-";
  const windSpeed = weather?.ws ?? "-";
  const desc = weather?.weather_desc ?? weather?.cuaca ?? "Cerah Berawan";
  const location = weather?.desa || "Semarang";

  return (
    <div className="dashboard-weather-card">
      <div>
        <h2>{location}</h2>
        <div className="weather-temp">{temp}°</div>
        <h3>{desc}</h3>
        <p>Kelembapan {humidity}%</p>
        <p>Angin {windSpeed} km/jam</p>
        <span>{formatTime(weather?.local_datetime)}</span>
      </div>

      <div className="weather-icon-preview">
        <div className="sun" />
        <div className="cloud cloud-1" />
      </div>
    </div>
  );
}

function TideMiniTable({ data }) {
  return (
    <div className="dashboard-content-card">
      <div className="dashboard-card-title">
        Rincian Informasi Potensi Rob
      </div>

      <div className="dashboard-table-wrapper">
        <table className="dashboard-mini-table">
          <thead>
            <tr>
              <th>Lokasi</th>
              <th>Status</th>
              <th>Potensi Rob</th>
              <th>Kenaikan</th>
              <th>Waktu</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, index) => {
              const value = getTideValue(item);
              const potential = getRobPotential(value);

              return (
                <tr key={item.id || index}>
                  <td>{getAreaName(item)}</td>
                  <td>{item.status || "-"}</td>
                  <td>
                    <span className={`rob-badge ${potential.toLowerCase()}`}>
                      {potential}
                    </span>
                  </td>
                  <td>{value} m</td>
                  <td>{formatDateTime(item.datetime)} WIB</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RobMapPreview({ data }) {
  return (
    <div className="dashboard-content-card p-0">
      <RobPotentialMap locations={data} height="100%" />
    </div>
  );
}

function DashboardContent() {
  const [selectedWeather, setSelectedWeather] = useState(null);
  const [weatherData, setWeatherData] = useState([]);
  const [tideData, setTideData] = useState([]);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [countdown, setCountdown] = useState(60);
  const [searchKelurahan, setSearchKelurahan] = useState("");
  const [filterKecamatan, setFilterKecamatan] = useState("Semua Kecamatan");

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

  async function fetchTideData() {
    try {
      const response = await api.get("/pasang-surut");
      const rawData = response.data.data || [];

      const filteredData = rawData.filter((item) => {
        const text = normalizeText(JSON.stringify(item));

        return ROB_AREAS.some((area) =>
          text.includes(normalizeText(area))
        );
      });

      setTideData(filteredData);
    } catch (error) {
      console.error("Gagal mengambil data pasang surut:", error);
    }

  }

  useEffect(() => {
    fetchWeather();
    fetchTideData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchWeather();
          return 60;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const kecamatanList = useMemo(() => {
    const list = weatherData.map((item) => item.kecamatan).filter(Boolean);
    return ["Semua Kecamatan", ...new Set(list)];
  }, [weatherData]);

  const filteredCuaca = useMemo(() => {
    return weatherData.filter((item) => {
      const matchKelurahan = normalizeText(item.desa).includes(
        normalizeText(searchKelurahan)
      );

      const matchKecamatan =
        filterKecamatan === "Semua Kecamatan" ||
        item.kecamatan === filterKecamatan;

      return matchKelurahan && matchKecamatan;
    });
  }, [weatherData, searchKelurahan, filterKecamatan]);

  return (
    <main className="dashboard-page">
      <section className="dashboard-frame">
        <div>

          <p
            className="mb-2"
            style={{
              color: "#0ea5e9",
              letterSpacing: "2px",
              fontWeight: "700",
              fontSize: "13px",
            }}
          >
            Dashboard BMKG 
          </p>

          <p
            className="fw-bold mb-3"
            style={{
              fontSize: "42px",
              color: "#0f172a",
            }}
          >
            Informasi Cuaca dan Potensi Rob di Semarang
          </p>

        </div>
        
        <div className="dashboard-grid">
          <div className="dashboard-box box-weather">
            <WeatherCard weather={selectedWeather || weatherData?.[0]} />
          </div>

          <div className="dashboard-box box-map-weather">
            <WeatherMapView
              filteredCuaca={filteredCuaca}
              loading={loadingWeather}
              countdown={countdown}
              searchKelurahan={searchKelurahan}
              setSearchKelurahan={setSearchKelurahan}
              filterKecamatan={filterKecamatan}
              setFilterKecamatan={setFilterKecamatan}
              kecamatanList={kecamatanList}
              onWeatherSelect={setSelectedWeather}
            />
          </div>

          <div className="dashboard-box box-tide">
            <TideMiniTable data={tideData} />
          </div>

          <div className="dashboard-box box-rob">
            <RobMapPreview data={tideData} />
          </div>
        </div>
      </section>
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