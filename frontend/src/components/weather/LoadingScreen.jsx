export default function LoadingScreen() {

  return (

    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        height: "700px",
        borderRadius: "30px",
        background: "#ffffff",
      }}
    >

      <div className="text-center">

        <div
          className="spinner-border text-info mb-3"
          role="status"
        />

        <p style={{ color: "#64748b" }}>
          Loading data cuaca...
        </p>

      </div>

    </div>

  );

}