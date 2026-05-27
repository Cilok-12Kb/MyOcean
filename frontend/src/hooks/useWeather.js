import { useEffect, useMemo, useState } from "react";

import { getWeatherData } from "../services/weatherService";

import {
  formatWeatherData,
  filterWeatherData,
} from "../utils/weatherHelpers";

export default function useWeather() {

  const [loading, setLoading] = useState(true);

  const [weatherData, setWeatherData] = useState([]);

  const [countdown, setCountdown] = useState(60);

  const [lastUpdate, setLastUpdate] = useState(null);

  const [selectedWilayah, setSelectedWilayah] = useState(null);

  const [searchKelurahan, setSearchKelurahan] = useState("");

  const [filterKecamatan, setFilterKecamatan] =
    useState("Seluruh Kecamatan");
    
  const fetchWeather = async () => {

    try {

      const response = await getWeatherData();

      if (!response.data) {
        return;
      }

      const formatted = formatWeatherData(response.data);

      setWeatherData(formatted);

      setLastUpdate(
        new Date().toLocaleString("id-ID", {
          dateStyle: "medium",
          timeStyle: "medium",
        })
      );

      setCountdown(60);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    fetchWeather();

    const fetchInterval = setInterval(() => {
      fetchWeather();
    }, 60000);

    const countdownInterval = setInterval(() => {

      setCountdown((prev) => {

        if (prev <= 1) {
          return 60;
        }

        return prev - 1;
      });

    }, 1000);

    return () => {
      clearInterval(fetchInterval);
      clearInterval(countdownInterval);
    };

  }, []);

  const filteredData = useMemo(() => {

    return filterWeatherData(
      weatherData,
      searchKelurahan,
      filterKecamatan
    );

  }, [
    weatherData,
    searchKelurahan,
    filterKecamatan,
  ]);

  return {
    loading,
    weatherData,
    filteredData,
    countdown,
    lastUpdate,
    selectedWilayah,
    setSelectedWilayah,
    searchKelurahan,
    setSearchKelurahan,
    filterKecamatan,
    setFilterKecamatan,
  };
}