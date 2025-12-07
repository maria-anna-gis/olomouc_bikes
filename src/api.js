// src/api.js
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

/**
 * Convert any value to a non-negative integer (or 0).
 */
function toInt(v) {
  const n = parseInt(v, 10);
  return Number.isNaN(n) || n < 0 ? 0 : n;
}

/**
 * Fetch all Nextbike stations in CZ around Olomouc using the "maps" feed.
 *
 * We call:
 *   https://api.nextbike.net/maps/nextbike-live.json?countries=CZ&lat=...&lng=...&distance=...
 *
 * Response structure:
 *   {
 *     countries: [
 *       {
 *         cities: [
 *           {
 *             uid, name, ...
 *             places: [
 *               {
 *                 uid, number, name, lat, lng,
 *                 bikes, bike_racks, free_racks, ...
 *               }
 *             ]
 *           }
 *         ]
 *       }
 *     ]
 *   }
 */
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
        // Basic sanity checks on coordinates
        if (
          typeof place.lat !== "number" ||
          typeof place.lng !== "number"
        ) {
          return;
        }

        // Filter to Olomouc bbox (adjust in CONFIG if needed)
        if (
          place.lat < bbox.minLat ||
          place.lat > bbox.maxLat ||
          place.lng < bbox.minLon ||
          place.lng > bbox.maxLon
        ) {
          return;
        }

        // ---- Bikes ----
        const bikes = toInt(place.bikes);

        // ---- Capacity ----
        let capacity = toInt(place.bike_racks);

        // If bike_racks missing/zero, fall back to bikes + free_racks
        if (!capacity) {
          const freeRacksRaw = toInt(place.free_racks);
          capacity = bikes + freeRacksRaw;
        }

        // Safety net: avoid 0 capacity or capacity < bikes
        if (!capacity || capacity < bikes) {
          capacity = Math.max(bikes, 1);
        }

        // ---- Docks & fullness ----
        const docksAvailable = Math.max(0, capacity - bikes);
        const fullness = capacity > 0 ? bikes / capacity : 0;

        stations.push({
          id: place.uid, // Nextbike station UID
          number: place.number,
          name: place.name,
          cityUid: city.uid,
          cityName: city.name,
          lat: place.lat,
          lon: place.lng,
          bikesAvailable: bikes,
          docksAvailable,
          capacity,
          fullness,
          timestamp: now,
          // expose raw place in case you want to inspect it in dev tools
          raw: place
        });
      });
    });
  });

  // Debug: log one sample station so you can inspect raw fields
  if (stations.length > 0) {
    console.log("Sample station object:", stations[0]);
    console.log("Raw place from API:", stations[0].raw);
  } else {
    console.warn("No stations found in bbox – check CONFIG.bbox.");
  }

  return stations;
}

export { fetchStations };
