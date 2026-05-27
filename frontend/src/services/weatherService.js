import api from "./api";

export const getWeatherData = async () => {
  const response = await api.get("/cuaca-semarang");
  return response.data;
};