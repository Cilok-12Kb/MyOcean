import PublicNavbar from "../../components/PublicNavbar";

export default function MarinMinamo() {

  return (
    <>
      <PublicNavbar />

      <div className="container-fluid p-5">

        <div className="card border-0 shadow-sm rounded-4 p-5">

          <h1 className="fw-bold">
            🤖 Marin Minamo
          </h1>

          <p className="mt-3 text-secondary">
            AI Assistant untuk monitoring banjir rob,
            kondisi cuaca, pasang surut laut,
            dan peringatan dini realtime.
          </p>

          <div className="mt-4">

            <button className="btn btn-primary px-4 py-2 rounded-3">
              Mulai Percakapan
            </button>

          </div>

        </div>

      </div>
    </>
  );
}