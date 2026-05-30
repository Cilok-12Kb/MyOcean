import { useState } from "react";
import EndminTopbar from "../../components/EndminTopbar";

import useWeather from "../../hooks/useWeather";
import WeatherHeader from "../../components/weather/WeatherHeader";
import WeatherMapView from "../../components/weather/WeatherMap";
import WeatherSidebar from "../../components/weather/WeatherSidebar";
import useWeatherRataRata   from "../../hooks/useWeatherRataRata";
import WeatherSummaryBar    from "../../components/weather/WeatherSummaryBar";

const KECAMATAN_LIST = [
  "Seluruh Kecamatan",
  "Banyumanik",
  "Candisari",
  "Gajahmungkur",
  "Gayamsari",
  "Genuk",
  "Gunungpati",
  "Mijen",
  "Ngaliyan",
  "Pedurungan",
  "Semarang Barat",
  "Semarang Selatan",
  "Semarang Tengah",
  "Semarang Timur",
  "Semarang Utara",
  "Tembalang",
  "Tugu",
];

export default function Cuaca() {
  const { rata, loading: loadingRata }                = useWeatherRataRata();

  const { cuacaList, lastUpdate, loading, countdown } = useWeather();

  const [searchKelurahan, setSearchKelurahan] = useState("");
  const [filterKecamatan, setFilterKecamatan] = useState("Semua");

  const filteredCuaca = cuacaList.filter((item) => {

    const cocokKelurahan = item.desa
      .toLowerCase()
      .includes(searchKelurahan.toLowerCase());

    const cocokKecamatan =
      filterKecamatan === "Semua"
        ? true
        : item.kecamatan
            .toLowerCase()
            .includes(filterKecamatan.toLowerCase());

    return cocokKelurahan && cocokKecamatan;

  });

  return (

    <>

      <EndminTopbar />

      <div
        className="min-vh-100 pb-4 px-3 px-md-4"
        style={{
          background: "linear-gradient(to bottom, #f8fafc, #eef2ff)",
          paddingTop: "90px",
        }}
      >

        <div
          className="rounded-5 overflow-hidden"
          style={{
            overflow: "clip",  // ganti overflow-hidden Bootstrap dengan ini
            background: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 10px 40px rgba(15,23,42,0.06)",
          }}
        >

          {/* HEADER */}
          <WeatherHeader
            totalWilayah={filteredCuaca.length}
            lastUpdate={lastUpdate}
          />

          {/* ← Summary bar di sini, antara header dan konten */}
          <WeatherSummaryBar rata={rata} loading={loadingRata} />

          {/* CONTENT */}
          <div className="p-4 pt-0" style={{ marginTop: "-20px" }}>

            <div className="row g-4">

              {/* MAP */}
              <div className="col-lg-8">

                <WeatherMapView
                  filteredCuaca={filteredCuaca}
                  loading={loading}
                  countdown={countdown}
                  searchKelurahan={searchKelurahan}
                  setSearchKelurahan={setSearchKelurahan}
                  filterKecamatan={filterKecamatan}
                  setFilterKecamatan={setFilterKecamatan}
                  kecamatanList={KECAMATAN_LIST}
                />

              </div>

              {/* SIDEBAR */}
              <div className="col-lg-4">

                <WeatherSidebar filteredCuaca={filteredCuaca} />

              </div>

            </div>

          </div>

        </div>

      </div>

    </>

  );

}