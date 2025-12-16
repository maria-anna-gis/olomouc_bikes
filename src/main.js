import { CONFIG } from "./config.js";
import { fetchStations } from "./api.js";
import { setSnapshot } from "./state.js";
import { initMap, updateMapMarkers } from "./map.js";
import { updateHeaderStation, initInfoOverlay, showInfoOverlay } from "./ui.js";

async function pollOnce() {
  try {
    const stations = await fetchStations();
    setSnapshot(stations);
    updateMapMarkers();
  } catch (err) {
    console.error("Error fetching stations:", err);
  }
}

function handleStationHover(station) {
  updateHeaderStation(station);
}

function handleInfoClick() {
  showInfoOverlay();
}

function startApp() {
  initInfoOverlay(); // wire close button
  initMap(handleStationHover, handleInfoClick);
  pollOnce();
  setInterval(pollOnce, CONFIG.refreshIntervalMs);
}

startApp();