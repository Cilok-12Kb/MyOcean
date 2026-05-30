import { useEffect, useState } from "react";

export default function useWeather() {

  const [countdown, setCountdown] = useState(60);
  const [cuacaList, setCuacaList] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchCuaca = async () => {

      try {

        const response = await fetch(
          "http://127.0.0.1:8000/api/cuaca-semarang"
        );

        const data = await response.json();

        console.log("DATA BMKG:", data);

        if (!data.data) return;

        const hasil = data.data.map((item) => ({
          desa: item.desa,
          kecamatan: item.kecamatan,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          suhu: item.t,
          cuaca: item.weather_desc,
          kelembapan: item.hu,
          angin: item.ws,
          waktu: item.local_datetime,
          prakiraan: item.prakiraan || [],
        }));

        setCuacaList(hasil);

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

    fetchCuaca();

    const fetchInterval = setInterval(() => {
      fetchCuaca();
    }, 60000);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);

    return () => {
      clearInterval(fetchInterval);
      clearInterval(countdownInterval);
    };

  }, []);

  return {
    cuacaList,
    lastUpdate,
    loading,
    countdown,
  };

}