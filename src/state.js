import { CONFIG } from "./config.js";

let lastSnapshot = []; // [{...station}]
const historyByStation = new Map(); // stationId -> [{timestamp,bikes,fullness,...}]
let selectedStationId = null;

function setSnapshot(stations) {
  lastSnapshot = stations;

  const maxPoints = CONFIG.maxHistoryPointsPerStation;

  stations.forEach((s) => {
    let arr = historyByStation.get(s.id);
    if (!arr) {
      arr = [];
      historyByStation.set(s.id, arr);
    }
    arr.push({
      timestamp: s.timestamp,
      bikesAvailable: s.bikesAvailable,
      docksAvailable: s.docksAvailable,
      fullness: s.fullness
    });
    if (arr.length > maxPoints) {
      arr.shift();
    }
  });
}

function getSnapshot() {
  return lastSnapshot;
}

// ---- selection ----

function setSelectedStation(id) {
  selectedStationId = id;
}

function getSelectedStationId() {
  return selectedStationId;
}

function getSelectedStation() {
  if (selectedStationId == null) return null;
  return lastSnapshot.find((s) => s.id === selectedStationId) || null;
}

function getHistoryForStation(id) {
  return historyByStation.get(id) || [];
}

function getHistoryForSelected() {
  if (selectedStationId == null) return [];
  return getHistoryForStation(selectedStationId);
}

export {
  setSnapshot,
  getSnapshot,
  setSelectedStation,
  getSelectedStationId,
  getSelectedStation,
  getHistoryForSelected
};
