import PublicNavbar from "../../components/PublicNavbar";

export default function PasangSurut() {

  return (

    <>
    
      <PublicNavbar />

      <div className="container mt-4">

        <div className="card shadow-sm border-0">

          <div className="card-body">

            <h1 className="fw-bold">
              Pasang Surut
            </h1>

            <p>
              Sistem monitoring realtime Pasang Surut
              berbasis data BMKG.
            </p>

          </div>

        </div>

      </div>

    </>
  );
}