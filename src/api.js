import { CONFIG } from "./config.js";

/**
 * Fetch JSON with basic error handling.
 */
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error ${res.status} for ${url}`);
  }
  return res.json();
}

//Convert any value to a non-negative integer (or 0).

function toInt(v) {
  const n = parseInt(v, 10);
  return Number.isNaN(n) || n < 0 ? 0 : n;
}

//Fetch all Nextbike stations in CZ around Olomouc using the "maps" feed
async function fetchStations() {
  const { apiBaseUrl, map, searchRadiusMeters, bbox } = CONFIG;

  const params = new URLSearchParams({
    countries: "CZ",
    lat: String(map.center[0]),
    lng: String(map.center[1])
  });

  if (searchRadiusMeters && Number.isFinite(searchRadiusMeters)) {
    params.set("distance", String(searchRadiusMeters));
  }

  const url = `${apiBaseUrl}?${params.toString()}`;
  const json = await fetchJson(url);

  const countries = json.countries || [];
  const now = new Date();
  const stations = [];

  countries.forEach((country) => {
    const cities = country.cities || [];
    cities.forEach((city) => {
      const places = city.places || [];
      places.forEach((place) => {
        // skip invalid coords
        if (
          typeof place.lat !== "number" ||
          typeof place.lng !== "number"
        ) {
          return;
        }

        // filter to Olomouc bbox
        if (
          place.lat < bbox.minLat ||
          place.lat > bbox.maxLat ||
          place.lng < bbox.minLon ||
          place.lng > bbox.maxLon
        ) {
          return;
        }

        const bikes = toInt(place.bikes);

        stations.push({
          id: place.uid,
          number: place.number,
          name: place.name,
          cityUid: city.uid,
          cityName: city.name,
          lat: place.lat,
          lon: place.lng,
          bikesAvailable: bikes,
          timestamp: now,
          raw: place
        });
      });
    });
  });

  if (stations.length > 0) {
    console.log("Sample station:", stations[0]);
  } else {
    console.warn("No stations found in bbox – check CONFIG.bbox.");
  }

  return stations;
}

export { fetchStations };