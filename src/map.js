import { CONFIG } from "./config.js";
import { getSnapshot } from "./state.js";

let mapInstance = null;
let markersLayer = null;
const markerById = new Map();

/**
 * Color by fullness:
 * 0   -> blue-ish (empty)
 * 0.5 -> yellow-ish
 * 1   -> red (full)
 */
function colorForFullness(fullness) {
  const f = Math.max(0, Math.min(1, fullness));

  if (f < 0.5) {
    // blue to yellow
    const t = f / 0.5;
    const r = Math.round(0 + t * 255);
    const g = Math.round(128 + t * 127);
    const b = 255;
    return `rgb(${r},${g},${b})`;
  } else {
    // yellow to red
    const t = (f - 0.5) / 0.5;
    const r = 255;
    const g = Math.round(255 - t * 255);
    const b = 0;
    return `rgb(${r},${g},${b})`;
  }
}

/**
 * Marker radius scaled by capacity & fullness.
 */
function radiusForStation(st) {
  const base = 6;
  const capFactor = Math.sqrt(st.capacity || 1);
  const fullnessFactor = 4 + st.fullness * 6;
  return base + capFactor + fullnessFactor;
}

function initMap(onStationClick) {
  mapInstance = L.map("map").setView(
    CONFIG.map.center,
    CONFIG.map.zoom
  );

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
    }
  ).addTo(mapInstance);

  markersLayer = L.layerGroup().addTo(mapInstance);

  // Save callback for later
  mapInstance._onStationClick = onStationClick;
}

function updateMapMarkers() {
  if (!mapInstance || !markersLayer) return;

  const stations = getSnapshot();
  if (!stations.length) return;

  const seen = new Set();

  stations.forEach((st) => {
    seen.add(st.id);

    const color = colorForFullness(st.fullness);
    const radius = radiusForStation(st);

    const popupHtml = `
      <strong>${st.name}</strong><br/>
      Bikes: ${st.bikesAvailable}<br/>
      Docks: ${st.docksAvailable}<br/>
      Fullness: ${Math.round(st.fullness * 100)} %
    `;

    let marker = markerById.get(st.id);

    if (!marker) {
      marker = L.circleMarker([st.lat, st.lon], {
        radius,
        color: "#111",
        weight: 1,
        fillColor: color,
        fillOpacity: 0.9
      }).bindPopup(popupHtml);

      marker.on("click", () => {
        if (typeof mapInstance._onStationClick === "function") {
          mapInstance._onStationClick(st.id);
        }
      });

      marker.addTo(markersLayer);
      markerById.set(st.id, marker);
    } else {
      marker.setStyle({
        radius,
        fillColor: color
      });
      marker.setPopupContent(popupHtml);
      marker.setLatLng([st.lat, st.lon]);
    }
  });

  // Remove markers that disappeared
  markerById.forEach((marker, id) => {
    if (!seen.has(id)) {
      markersLayer.removeLayer(marker);
      markerById.delete(id);
    }
  });
}

export { initMap, updateMapMarkers };
