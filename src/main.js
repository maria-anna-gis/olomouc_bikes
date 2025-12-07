import { CONFIG } from "./config.js";
import { fetchStations } from "./api.js";
import {
  setSnapshot,
  setSelectedStation,
  getSelectedStation,
  getHistoryForSelected,
  getSelectedStationId
} from "./state.js";
import {
  updateCurrentStatus,
  updateStatusMessage,
  updateStatsPanel
} from "./ui.js";
import { initMap, updateMapMarkers } from "./map.js";
import { initChart, updateChart } from "./chart.js";

async function pollOnce() {
  try {
    updateStatusMessage("Loading latest data…");
    const stations = await fetchStations();
    setSnapshot(stations);

    // Update map markers for all stations
    updateMapMarkers();

    // If something is already selected, refresh its panel/chart
    if (getSelectedStationId() != null) {
      const selectedStation = getSelectedStation();
      const history = getHistoryForSelected();
      updateCurrentStatus(selectedStation);
      updateStatsPanel();
      updateChart(history);
      updateStatusMessage("");
    } else {
      updateStatusMessage("Click any station on the map to view details.");
    }
  } catch (err) {
    console.error(err);
    updateStatusMessage(`Error: ${err.message}`);
  }
}

function handleStationClick(stationId) {
  setSelectedStation(stationId);
  const selectedStation = getSelectedStation();
  const history = getHistoryForSelected();

  updateCurrentStatus(selectedStation);
  updateStatsPanel();
  updateChart(history);
  updateStatusMessage("");
}

function startApp() {
  initMap(handleStationClick);
  initChart();
  pollOnce();
  setInterval(pollOnce, CONFIG.refreshIntervalMs);
}

startApp();
