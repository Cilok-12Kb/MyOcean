import ForecastCard from "./ForecastCard";

export default function WeatherSidebar({
  filteredData,
  selectedWilayah,
  setSelectedWilayah,
}) {

  return (

    <div
      className="rounded-5 p-4 h-100"
      style={{
        background: "#ffffff",
        border:
          "1px solid rgba(0,0,0,0.06)",
      }}
    >

      <h5 className="fw-bold mb-4">
        Data Wilayah
      </h5>

      <div
        style={{
          maxHeight: "320px",
          overflowY: "auto",
        }}
      >

        <table className="table align-middle">

          <tbody>

            {filteredData.map((item, index) => (

              <tr key={index}>

                <td>

                  <div className="fw-semibold">
                    {item.desa}
                  </div>

                  <small className="text-secondary">
                    {item.kecamatan}
                  </small>

                </td>

                <td>
                  <strong>{item.suhu}°C</strong>
                </td>

                <td>

                  <button
                    className="btn btn-primary btn-sm rounded-pill"
                    onClick={() =>
                      setSelectedWilayah(item)
                    }
                  >
                    Lihat
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {selectedWilayah && (

        <div className="mt-4">

          <h5 className="fw-bold">
            {selectedWilayah.desa}
          </h5>

          <div className="d-flex gap-3 overflow-auto pb-2 mt-3">

            {selectedWilayah.prakiraan.map(
              (jam, index) => (
                <ForecastCard
                  key={index}
                  jam={jam}
                />
              )
            )}

          </div>

        </div>

      )}

    </div>
  );
}