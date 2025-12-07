import { getHistoryForSelected } from "./state.js";

function updateCurrentStatus(station) {
  const nameEl = document.getElementById("station-name");
  const bikesEl = document.getElementById("bikes-now");
  const docksEl = document.getElementById("docks-now");
  const fullEl = document.getElementById("fullness-now");
  const updatedEl = document.getElementById("updated-at");

  if (!station) {
    nameEl.textContent = "Nothing selected";
    bikesEl.textContent = "–";
    docksEl.textContent = "–";
    fullEl.textContent = "–";
    updatedEl.textContent = "–";
    return;
  }

  nameEl.textContent = station.name;
  bikesEl.textContent = station.bikesAvailable;
  docksEl.textContent = station.docksAvailable;
  fullEl.textContent = `${Math.round(station.fullness * 100)} %`;
  updatedEl.textContent = station.timestamp.toLocaleTimeString();
}

function updateStatusMessage(msg) {
  const el = document.getElementById("status-message");
  el.textContent = msg || "";
}

function updateStatsPanel() {
  const history = getHistoryForSelected();
  const minEl = document.getElementById("min-bikes");
  const maxEl = document.getElementById("max-bikes");
  const avgEl = document.getElementById("avg-bikes");
  const avgFullEl = document.getElementById("avg-fullness");

  if (!history.length) {
    minEl.textContent = "–";
    maxEl.textContent = "–";
    avgEl.textContent = "–";
    avgFullEl.textContent = "–";
    return;
  }

  const bikes = history.map((h) => h.bikesAvailable);
  const fullness = history.map((h) => h.fullness);

  const minB = Math.min(...bikes);
  const maxB = Math.max(...bikes);
  const avgB = bikes.reduce((a, b) => a + b, 0) / bikes.length;
  const avgF =
    fullness.reduce((a, b) => a + b, 0) / fullness.length;

  minEl.textContent = String(minB);
  maxEl.textContent = String(maxB);
  avgEl.textContent = avgB.toFixed(1);
  avgFullEl.textContent = `${(avgF * 100).toFixed(1)} %`;
}

export { updateCurrentStatus, updateStatusMessage, updateStatsPanel };
