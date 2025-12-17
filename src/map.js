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
// 0 = yellow (low), 9 = red (high)
function colorForClass(cls) {
  const t = cls / 9; // 0–1
  const start = { r: 252, g: 218, b: 72 }; // yellow
  const end = { r: 255, g: 0, b: 0 };     // red

  const r = Math.round(start.r + t * (end.r - start.r));
  const g = Math.round(start.g + t * (end.g - start.g));
  const b = Math.round(start.b + t * (end.b - start.b));

  return `rgb(${r},${g},${b})`;
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
        "Jawg Matrix": L.tileLayer(
      "https://tile.jawg.io/jawg-matrix/{z}/{x}/{y}{r}.png?access-token=ifkJibgtQCUvnN431uaaxWnxzBuuuMGFed6OVyzYpFJEf02yYsyTC4ZhzopqMLOn",
      {
        attribution: "© Jawg Maps © OpenStreetMap contributors",
        minZoom: 0,
        maxZoom: 22
      }
    ),
    CyclOSM: L.tileLayer(
      "https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png",
      {
        maxZoom: 20,
        attribution:
          'CyclOSM | Map data: © OpenStreetMap contributors'
      }
    )
  };

  baseMaps["Jawg Matrix"].addTo(mapInstance);
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

  // Legend control
const legendControl = L.control({ position: "bottomleft" });

legendControl.onAdd = function () {
  const div = L.DomUtil.create("div", "map-legend");
  div.innerHTML = "<h4>Bikes Available</h4>";

  // 10 osztály
  for (let cls = 0; cls <= 9; cls++) {
    const color = colorForClass(cls);
    const radius = radiusForClass(cls);
    div.innerHTML += `
      <div class="legend-item">
        <span class="legend-circle" style="
          background-color: ${color};
          width: ${radius * 2}px;
          height: ${radius * 2}px;
          margin-right: 0.5rem;
        "></span>
        ${cls} ${cls === 9 ? "+" : ""}
      </div>
    `;
  }

  return div;
};

legendControl.addTo(mapInstance);

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
        weight: 0,
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
