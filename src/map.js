import { CONFIG } from "./config.js";
import { getSnapshot } from "./state.js";

let mapInstance = null;
let markersLayer = null;
const markerById = new Map();

//10-class classification based on bikes between minBikes and maxBikes. Returns integer 0–9.
function getBikeClass(bikes, minBikes, maxBikes) {
  if (maxBikes <= minBikes) {
    return bikes > 0 ? 9 : 0;
  }
  const ratio = (bikes - minBikes) / (maxBikes - minBikes); // 0–1
  let cls = Math.floor(ratio * 10); // 0–10
  if (cls > 9) cls = 9;
  if (cls < 0) cls = 0;
  return cls;
}

//Colour ramp by class (0 = low, 9 = high).

function colorForClass(cls) {
  const t = cls / 9; // 0–1

  if (t < 0.5) {
    const u = t / 0.5;
    const r = Math.round(0 + u * 255);
    const g = Math.round(128 + u * 127);
    const b = 255;
    return `rgb(${r},${g},${b})`;
  } else {
    const u = (t - 0.5) / 0.5;
    const r = 255;
    const g = Math.round(255 - u * 255);
    const b = 0;
    return `rgb(${r},${g},${b})`;
  }
}

//Radius ramp by class (0 = smallest, 9 = largest).

function radiusForClass(cls) {
  const minR = 4;
  const maxR = 22;
  const t = cls / 9; // 0–1
  return minR + t * (maxR - minR);
}

function initMap(onStationHover, onInfoClick) {
  mapInstance = L.map("map").setView(
    CONFIG.map.center,
    CONFIG.map.zoom
  );

  // Basemaps
  const baseMaps = {
    CyclOSM: L.tileLayer(
      "https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png",
      {
        maxZoom: 20,
        attribution:
          'CyclOSM | Map data: © OpenStreetMap contributors'
      }
    ),
    "Jawg Matrix": L.tileLayer(
      "https://tile.jawg.io/jawg-matrix/{z}/{x}/{y}{r}.png?access-token=ifkJibgtQCUvnN431uaaxWnxzBuuuMGFed6OVyzYpFJEf02yYsyTC4ZhzopqMLOn",
      {
        attribution: "© Jawg Maps © OpenStreetMap contributors",
        minZoom: 0,
        maxZoom: 22
      }
    )
  };

  baseMaps.CyclOSM.addTo(mapInstance);
  const layerControl = L.control.layers(baseMaps).addTo(mapInstance);

  markersLayer = L.layerGroup().addTo(mapInstance);

  // store hover callback
  mapInstance._onStationHover = onStationHover;

  // Info button control (under layers)
  const infoControl = L.control({ position: "topright" });

  infoControl.onAdd = function () {
    const div = L.DomUtil.create(
      "div",
      "leaflet-control leaflet-bar leaflet-control-info"
    );
    div.innerHTML = "i";

    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.on(div, "click", (e) => {
      L.DomEvent.stop(e);
      if (typeof onInfoClick === "function") {
        onInfoClick();
      }
    });

    return div;
  };

  infoControl.addTo(mapInstance);
}

function updateMapMarkers() {
  if (!mapInstance || !markersLayer) return;

  const stations = getSnapshot();
  if (!stations.length) return;

  // min / max bikes for this snapshot
  let minBikes = Infinity;
  let maxBikes = -Infinity;
  stations.forEach((s) => {
    const b = s.bikesAvailable || 0;
    if (b < minBikes) minBikes = b;
    if (b > maxBikes) maxBikes = b;
  });
  if (!Number.isFinite(minBikes)) minBikes = 0;
  if (!Number.isFinite(maxBikes)) maxBikes = 0;

  const seen = new Set();

  stations.forEach((st) => {
    seen.add(st.id);

    const bikes = st.bikesAvailable || 0;
    const cls = getBikeClass(bikes, minBikes, maxBikes);
    const color = colorForClass(cls);
    const radius = radiusForClass(cls);

    let marker = markerById.get(st.id);

    if (!marker) {
      marker = L.circleMarker([st.lat, st.lon], {
        radius,
        color: "#111",
        weight: 1,
        fillColor: color,
        fillOpacity: 0.9
      });

      // hover: show station in header
      marker.on("mouseover", () => {
        if (typeof mapInstance._onStationHover === "function") {
          mapInstance._onStationHover(st);
        }
      });

      marker.on("mouseout", () => {
        if (typeof mapInstance._onStationHover === "function") {
          mapInstance._onStationHover(null);
        }
      });

      marker.addTo(markersLayer);
      markerById.set(st.id, marker);
    } else {
      marker.setStyle({
        radius,
        fillColor: color
      });
      marker.setLatLng([st.lat, st.lon]);
    }
  });

  // remove markers for stations that disappeared
  markerById.forEach((marker, id) => {
    if (!seen.has(id)) {
      markersLayer.removeLayer(marker);
      markerById.delete(id);
    }
  });
}

export { initMap, updateMapMarkers };
