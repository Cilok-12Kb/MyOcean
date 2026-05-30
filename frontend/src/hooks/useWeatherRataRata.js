// src/hooks/useWeatherRataRata.js
import { useEffect, useState } from "react";
import api from "../services/api";

export default function useWeatherRataRata() {
  const [rata, setRata]       = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRata = async () => {
    try {
      const token = localStorage.getItem("token");
      const res   = await api.get("/weather/rata-rata", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRata(res.data);
    } catch (err) {
      console.error("Gagal memuat rata-rata cuaca:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRata();
    const interval = setInterval(fetchRata, 60_000); // ← refresh tiap 60 detik
    return () => clearInterval(interval);             // ← cleanup saat unmount
  }, []);

  return { rata, loading };
}