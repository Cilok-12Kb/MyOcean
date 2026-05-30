import L from "leaflet";

export const getWeatherIcon = (cuaca) => {

  const kondisi = cuaca?.toLowerCase() || "";

  // CERAH
  if (kondisi.includes("cerah") && !kondisi.includes("berawan")) {
    return new L.Icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/869/869869.png",
      iconSize: [34, 34],
    });
  }

  // CERAH BERAWAN
  if (kondisi.includes("cerah berawan")) {
    return new L.Icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/1163/1163661.png",
      iconSize: [34, 34],
    });
  }

  // BERAWAN
  if (kondisi.includes("berawan")) {
    return new L.Icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/414/414825.png",
      iconSize: [34, 34],
    });
  }

  // HUJAN RINGAN
  if (kondisi.includes("hujan ringan")) {
    return new L.Icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/3313/3313884.png",
      iconSize: [34, 34],
    });
  }

  // HUJAN SEDANG / HUJAN
  if (kondisi.includes("hujan")) {
    return new L.Icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/3351/3351979.png",
      iconSize: [34, 34],
    });
  }

  // PETIR
  if (kondisi.includes("petir")) {
    return new L.Icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/1146/1146860.png",
      iconSize: [34, 34],
    });
  }

  // KABUT
  if (kondisi.includes("kabut")) {
    return new L.Icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/4005/4005901.png",
      iconSize: [34, 34],
    });
  }

  // DEFAULT
  return new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/4834/4834559.png",
    iconSize: [34, 34],
  });

};