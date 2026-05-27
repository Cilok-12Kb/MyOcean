import PublicNavbar from "../../components/PublicNavbar";

import LoadingScreen from "../../components/weather/LoadingScreen";

import WeatherMap from "../../components/weather/WeatherMap";

import WeatherSidebar from "../../components/weather/WeatherSidebar";

import useWeather from "../../hooks/useWeather";

import "leaflet/dist/leaflet.css";

export default function Cuaca() {

  const {
    loading,
    filteredData,
    countdown,
    lastUpdate,
    selectedWilayah,
    setSelectedWilayah,
  } = useWeather();

  return (

    <>

      <PublicNavbar />

      <div className="container-fluid py-4 px-3 px-md-4">

        <div className="row g-4">

          <div className="col-lg-8">

            <div className="bg-white rounded-5 p-3 shadow-sm">

              <div className="d-flex justify-content-between align-items-center px-3 py-2">

                <div>
                  <h3 className="fw-bold mb-0">
                    Peta Cuaca Semarang
                  </h3>

                  <small className="text-secondary">
                    Update terakhir: {lastUpdate}
                  </small>
                </div>

                <div>
                  <span className="badge bg-info">
                    {countdown}s
                  </span>
                </div>

              </div>

              {loading ? (
                <LoadingScreen />
              ) : (
                <WeatherMap data={filteredData} />
              )}

            </div>

          </div>

          <div className="col-lg-4">

            <WeatherSidebar
              filteredData={filteredData}
              selectedWilayah={selectedWilayah}
              setSelectedWilayah={setSelectedWilayah}
            />

          </div>

        </div>

      </div>

    </>

  );
}