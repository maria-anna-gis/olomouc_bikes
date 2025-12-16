let lastSnapshot = []; // current list of stations

function setSnapshot(stations) {
  lastSnapshot = stations;
}

function getSnapshot() {
  return lastSnapshot;
}

export { setSnapshot, getSnapshot };