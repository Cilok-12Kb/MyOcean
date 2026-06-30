// src/components/potensi_rob/RobPolygonLayer.jsx
import { useRef } from "react";
import { GeoJSON } from "react-leaflet";
import { getRobColor, getRobPotential, buildRobFeatures } from "../../utils/tideHelpers";

const POTENSI_BADGE = {
  "Rendah": "success",
  "Sedang": "warning",
  "Tinggi": "danger",
};

// Layer GeoJSON overlay polygon potensi rob — dipakai bersama oleh peta admin
// (AdminPetaMap) dan peta publik (Peta.jsx), supaya warna, ambang batas, dan
// isi popup-nya selalu konsisten di kedua halaman.
export default function RobPolygonLayer({
  robData,
  fillOpacity = 0.5,
  hoverFillOpacity = 0.75,
  weight = 2,
  hoverWeight = 3,
}) {
  const geoJsonRef = useRef(null);
  const features = buildRobFeatures(robData);

  if (features.length === 0) return null;

  function style(feature) {
    const { tinggi_rob, tergenang } = feature.properties;
    const color = getRobColor(tinggi_rob, tergenang);
    return {
      fillColor:   color,
      fillOpacity,
      color,
      weight,
      opacity: 0.9,
    };
  }

  function onEachFeature(feature, layer) {
    const p = feature.properties;
    const level = getRobPotential(p.tinggi_rob);
    const badgeVariant = POTENSI_BADGE[level] || "secondary";

    layer.bindPopup(`
      <div class="py-3 px-2" style="min-width:200px;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif">
        <h6 class="fw-bold text-center mb-4" style="font-size:15px">${p.nama_wilayah}</h6>

        <div class="d-grid gap-2 mb-2">
          <div class="d-flex justify-content-between align-items-center bg-light rounded-3 px-3 py-2">
            <span class="text-secondary small">Tinggi tanah</span>
            <strong class="small">${p.tinggi_tanah} m</strong>
          </div>

          <div class="d-flex justify-content-between align-items-center bg-light rounded-3 px-3 py-2">
            <span class="text-secondary small">Tinggi air</span>
            <strong class="small">${p.tinggi_air != null ? p.tinggi_air + " m" : "-"}</strong>
          </div>

          <div class="d-flex justify-content-between align-items-center bg-light rounded-3 px-3 py-2">
            <span class="text-secondary small">Rob</span>
            <strong class="small">${p.tinggi_rob > 0 ? p.tinggi_rob + " m" : "Tidak tergenang"}</strong>
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center pt-3 mt-2 border-top">
          <span class="text-secondary small">Potensi</span>
          <span class="badge rounded-pill text-bg-${badgeVariant} text-uppercase px-3 py-1" style="font-size:10px;letter-spacing:0.3px">
            ${level}
          </span>
        </div>
      </div>
    `);

    layer.on("mouseover", () => layer.setStyle({ fillOpacity: hoverFillOpacity, weight: hoverWeight }));
    layer.on("mouseout",  () => layer.setStyle({ fillOpacity, weight }));
  }

  return (
    <GeoJSON
      ref={geoJsonRef}
      key={JSON.stringify(features.map(f => f.properties.tinggi_rob))}
      data={{ type: "FeatureCollection", features }}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
}