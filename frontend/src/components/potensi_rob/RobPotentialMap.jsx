import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "../../styles/RobPotentialMap.css";

const SEMARANG_CENTER = [-6.9667, 110.4167];

const pinIcon = L.divIcon({
  className: "custom-map-pin",
  html: `<div class="pin-dot"></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 26],
  popupAnchor: [0, -24],
});

function getRiskLevel(item) {
  const value = Number(item.tide_height || item.kenaikan_air || 0);

  if (value >= 2.2) return "danger";
  if (value >= 1.8) return "warning";
  if (value >= 1.5) return "medium";
  return "low";
}

function getRiskText(level) {
  const labels = {
    low: "Risiko Rendah",
    medium: "Risiko Sedang",
    warning: "Siaga",
    danger: "Darurat Rob",
  };

  return labels[level] || "Risiko Rendah";
}

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function InfoPopup({ location }) {
  const riskLevel = getRiskLevel(location);

  return (
    <div className="rob-map-popup">
      <div className="popup-date">
        {formatDate(location.datetime || location.local_datetime)} WIB
      </div>

      <h6>{location.lokasi || location.desa || "-"}</h6>

      <div className="info-row">
        <span>Pasang/Surut</span>
        <strong>{location.status || "-"}</strong>
      </div>

      <div className="info-row">
        <span>Kenaikan Air</span>
        <strong>
          {location.tide_height || location.kenaikan_air || 0} m
        </strong>
      </div>

      <div className="info-row">
        <span>Potensi Rob</span>
        <span className={`risk-status ${riskLevel}`}>
          {getRiskText(riskLevel)}
        </span>
      </div>
    </div>
  );
}

export default function RobPotentialMap({ locations = [], height = "100%" }) {
  return (
    <div className="rob-map-wrapper" style={{ height }}>
      <MapContainer
        center={SEMARANG_CENTER}
        zoom={11}
        minZoom={8}
        maxZoom={18}
        className="rob-map"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locations.map((location, index) => {
          const lat = Number(location.lat);
          const lon = Number(location.lon || location.lng);

          if (Number.isNaN(lat) || Number.isNaN(lon)) {
            return null;
          }

          return (
            <Marker
              key={location.id || index}
              position={[lat, lon]}
              icon={pinIcon}
            >
              <Popup>
                <InfoPopup location={location} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}