import L from "leaflet";

const createIcon = (url) => {
  return new L.Icon({
    iconUrl: url,
    iconSize: [34, 34],
  });
};

export const getWeatherIcon = (cuaca = "") => {

  const kondisi = cuaca.toLowerCase();

  if (
    kondisi.includes("cerah") &&
    !kondisi.includes("berawan")
  ) {
    return createIcon(
      "https://cdn-icons-png.flaticon.com/512/869/869869.png"
    );
  }

  if (kondisi.includes("cerah berawan")) {
    return createIcon(
      "https://cdn-icons-png.flaticon.com/512/1163/1163661.png"
    );
  }

  if (kondisi.includes("berawan")) {
    return createIcon(
      "https://cdn-icons-png.flaticon.com/512/414/414825.png"
    );
  }

  if (kondisi.includes("hujan ringan")) {
    return createIcon(
      "https://cdn-icons-png.flaticon.com/512/3313/3313884.png"
    );
  }

  if (kondisi.includes("hujan")) {
    return createIcon(
      "https://cdn-icons-png.flaticon.com/512/3351/3351979.png"
    );
  }

  if (kondisi.includes("petir")) {
    return createIcon(
      "https://cdn-icons-png.flaticon.com/512/1146/1146860.png"
    );
  }

  if (kondisi.includes("kabut")) {
    return createIcon(
      "https://cdn-icons-png.flaticon.com/512/4005/4005901.png"
    );
  }

  return createIcon(
    "https://cdn-icons-png.flaticon.com/512/4834/4834559.png"
  );
};