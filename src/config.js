export const CONFIG = {
  // Nextbike "maps" realtime feed (JSON), per docs/sharedmobility
  // Example: https://api.nextbike.net/maps/nextbike-live.json?countries=CZ
  apiBaseUrl: "https://api.nextbike.net/maps/nextbike-live.json",

  // Map center – Olomouc
  map: {
    center: [49.5938, 17.2509],
    zoom: 13
  },

  // Search radius (meters) around map center for stations
  searchRadiusMeters: 10000,

  // Optionally filter to a bounding box around Olomouc (extra safety)
  bbox: {
    minLat: 49.53,
    maxLat: 49.65,
    minLon: 17.18,
    maxLon: 17.35
  },

  // Polling & per-station history
  refreshIntervalMs: 60_000, // 1 minute
  maxHistoryPointsPerStation: 240 // ~4 hours at 1-min polling
};
