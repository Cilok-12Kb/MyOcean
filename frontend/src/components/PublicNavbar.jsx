import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import bmkgLogo from "../assets/images/Logo.jpg";

export default function PublicNavbar() {

  const [time, setTime] = useState(new Date());

  useEffect(() => {

    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);

  }, []);

  const formattedDate = time.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const wibTime = time.toLocaleTimeString("id-ID");

  const utcTime = time.toUTCString().split(" ")[4];

  return (
    <>

      {/* TOP BAR */}
      <div
        className="d-flex justify-content-between align-items-center px-5"
        style={{
          background: "#eef1f5",
          height: "48px",
          fontSize: "14px",
        }}
      >

        <div
          style={{
            color: "#4b5563",
            textTransform: "uppercase",
          }}
        >
          {formattedDate}
        </div>

        <div
          style={{
            color: "#4b5563",
            fontWeight: "500",
          }}
        >
          STANDAR WAKTU INDONESIA

          <span
            style={{
              color: "green",
              marginLeft: "15px",
              fontWeight: "bold",
              fontFamily: "monospace",
            }}
          >
            {wibTime}
          </span>

          <span className="mx-3">/</span>

          <span
            style={{
              color: "green",
              fontWeight: "bold",
              fontFamily: "monospace",
            }}
          >
            {utcTime} UTC
          </span>
        </div>

      </div>

      {/* MAIN NAVBAR */}
      <nav
        className="navbar navbar-expand-lg bg-white shadow-sm"
        style={{
          height: "86px",
        }}
      >

        <div className="container-fluid px-5">

          {/* LOGO */}
          <Link
            className="navbar-brand fw-bold d-flex align-items-center"
            to="/"
          >

            <img
              src={bmkgLogo}
              alt="BMKG Logo"
              style={{
                width: "58px",
                height: "58px",
                objectFit: "contain",
              }}
            />

            <div className="ms-2">

              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  lineHeight: "1.2",
                  color: "#111827",
                }}
              >
                MY_OCEAN
              </div>

              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                }}
              >
                MONITORING BANJIR ROB
              </div>

            </div>

          </Link>

          {/* MOBILE BUTTON */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* MENU */}
          <div
            className="collapse navbar-collapse"
            id="navbarNav"
          >

            <ul className="navbar-nav mx-auto">

              <li className="nav-item mx-2">
                <Link className="nav-link" to="/">
                  Dashboard
                </Link>
              </li>

              <li className="nav-item mx-2">
                <Link className="nav-link" to="/Pasang-Surut">
                  Pasang Surut
                </Link>
              </li>

              <li className="nav-item mx-2">
                <Link className="nav-link" to="/Peta">
                  Peta
                </Link>
              </li>

              <li className="nav-item mx-2">
                <Link className="nav-link" to="/Potensi-Rob">
                  Potensi Rob
                </Link>
              </li>

              <li className="nav-item mx-2">
                <Link className="nav-link" to="/Cuaca">
                  Cuaca
                </Link>
              </li>

            </ul>

            {/* AI CHATBOT BUTTON */}
            <Link
              className="btn btn-outline-primary rounded-3 px-4"
              to="/marin-minamo"
            >
              🤖 Marin Minamo
            </Link>

          </div>

        </div>

      </nav>

    </>
  );
}