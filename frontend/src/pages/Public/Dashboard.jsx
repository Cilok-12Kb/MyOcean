import PublicNavbar from "../../components/PublicNavbar";

export default function Dashboard() {

  return (

    <>
    
      <PublicNavbar />

      <div className="container mt-4">

        <div className="card shadow-sm border-0">

          <div className="card-body">

            <h1 className="fw-bold">
              Dashboard Monitoring Rob
            </h1>

            <p>
              Sistem monitoring realtime banjir rob
              berbasis data BMKG.
            </p>

          </div>

        </div>

      </div>

    </>
  );
}