export const formatWeatherData = (data) => {

  return data.map((item) => ({

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
};

export const filterWeatherData = (
  data,
  searchKelurahan,
  filterKecamatan
) => {

  return data.filter((item) => {

    const cocokKelurahan = item.desa
      .toLowerCase()
      .includes(searchKelurahan.toLowerCase());

    const cocokKecamatan =
      filterKecamatan === "Seluruh Kecamatan"
        ? true
        : item.kecamatan
            .toLowerCase()
            .includes(filterKecamatan.toLowerCase());

    return cocokKelurahan && cocokKecamatan;
  });
};