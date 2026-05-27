import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";

import { getWeatherIcon } from "../../utils/weatherIcons";

import WeatherPopup from "./WeatherPopup";

export default function WeatherMap({ data }) {

  return (

    <MapContainer
      center={[-6.9667, 110.4167]}
      zoom={11}
      style={{
        height: "750px",
        width: "100%",
      }}
    >

      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {data.map((item, index) => (

        <Marker
          key={index}
          position={[item.lat, item.lon]}
          icon={getWeatherIcon(item.cuaca)}
        >

          <Popup>
            <WeatherPopup item={item} />
          </Popup>

        </Marker>

      ))}

    </MapContainer>
  );
}