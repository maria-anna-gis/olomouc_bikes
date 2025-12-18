# Olomouc Nextbike Live Dashboard

This is a web-based GIS application for visualising live Nextbike bike-share usage in Olomouc, Czech Republic, developed by [@placcky](https://github.com/placcky) and [@maria-anna-gis](https://github.com/maria-anna-gis).
Circle size and colour represent the relative numbers of available bikes at each station across the city.

---


- Initial opening view:  
<img width="3071" height="1646" alt="Screenshot 2025-12-18 090642" src="https://github.com/user-attachments/assets/354298c7-7d7b-49d1-a593-cf216f08ba78" />

- Hover interaction and header info:  
<img width="3071" height="1639" alt="Screenshot 2025-12-18 090659" src="https://github.com/user-attachments/assets/50e897d4-e998-44ce-b440-ee7400414265" />

---

## Overview

The application provides a real-time overview of the Nextbike system in Olomouc using the public Nextbike API.  
It focuses on:

- **Visualising live bike availability** across all Olomouc stations.
- **Comparing stations** using simple graduated symbology (10 classes based on bike counts).
- **Minimal, clean UI**: a full-screen map with hover-based station info in the header.
- A short **intro panel** explaining the project, accessible via an “i” info button.

This project is primarily a learning / experimental GIS app for exploring live mobility data on the web.

---

## Data Sources

- **Bike share data**  
  - [Nextbike API documentation](https://github.com/nextbike/api-doc)  
  - Live data endpoint used in this app: `https://api.nextbike.net/maps/nextbike-live.json` (filtered to Olomouc stations in `api.js`).

- **Basemaps**  
  - [Jawg Matrix](https://www.jawg.io/) – Contrasting but contextual basemap 
  - ESRI Satellite - Alternative imagery basemap for comparison

- **Temporal characteristics**  
  - The app uses **live snapshots** only (no historical archive).  
  - Data is **refreshed approximately once per minute**.

---

## Project Structure

```text
olomouc_bikes/
├── assets/
│   └── css/
│       └── style.css            # Application styling
├── src/
│   ├── api.js                   # Fetches and parses Nextbike live data
│   ├── config.js                # Map centre, zoom, refresh interval, city config
│   ├── main.js                  # App entry point, polling loop wiring
│   ├── map.js                   # Leaflet map initialisation & station symbology
│   ├── state.js                 # Simple client-side state store (current snapshot)
│   └── ui.js                    # Header text updates & intro/info overlay logic
├── index.html                   # Main web application interface
└── README.md                    # This file
```

## File Descriptions

### Core Application Files

- **`index.html`**  
  Main web interface.  
  - Defines the header layout:
    - Title (“Nextbike – Olomouc Live Dashboard”)
    - Centre: dynamic message / hover info line
  - Contains the full-screen map container and the intro/info overlay.
  - Loads Leaflet, `style.css`, and the `src/main.js` module.

- **`assets/css/style.css`**  
  - Global layout, typography, colours (dark theme).
  - Full-height map layout (`.map-wrapper`, `#map`).
  - Styling for the intro/info overlay and its close button.
  - Minor tweaks for Leaflet UI (info button, scale bar, tooltips, etc.).

### JavaScript Modules

- **`src/main.js`**  
  Application entry point.
  - Initialises:
    - The info overlay close behaviour (`initInfoOverlay`).
    - The Leaflet map (`initMap`) with hover and info-button callbacks.
  - Periodically polls the Nextbike API (`pollOnce`) using `fetchStations`.
  - Stores the latest station snapshot in `state.js` and triggers `updateMapMarkers`.

- **`src/config.js`**  
  Central configuration for:
  - Map centre and default zoom for Olomouc.
  - Data refresh interval (e.g. ~60 seconds).
  - Any city/system-specific constants.

- **`src/api.js`**  
  Fetches live data from the Nextbike API (`nextbike-live.json`).
  - Filters/normalises the JSON into a simple station list, e.g.:
    ```js
    {
      id,
      name,
      lat,
      lon,
      bikesAvailable
    }
    ```
  - Exposes `fetchStations()` used by `main.js`.

- **`src/state.js`**  
  Minimal shared state:
  - Stores the current list of stations (`setSnapshot`, `getSnapshot`).
  - Used by `map.js` to render markers based on the latest snapshot.

- **`src/map.js`**  
  - Sets up the Leaflet map and basemap layers:
    - CyclOSM (OSM-based cycling map).
    - Esri World Imagery (satellite basemap).
  - Adds a **scale bar** and a custom **“i” info control**.
  - Renders stations as `L.circleMarker` features with **10-class graduated symbology** based on current bike counts:
    - Colour ramp from low to high.
    - Marker radius scaled from small (few bikes) to large (many bikes).
  - Handles **hover interactions**:
    - On `mouseover`, calls the hover callback with station details.
    - On `mouseout`, resets to “no station hovered”.
  - Rebuilds/updates markers when a new snapshot is fetched.

- **`src/ui.js`**  
  - Updates the header subtitle line:
    - Default: “Hover over a station to see the number of bikes”.
    - On hover: `Station Name (bikes: N)`.
  - Manages the intro/info overlay:
    - `initInfoOverlay()` wires the **“Got it”** close button.
    - `showInfoOverlay()` reopens the overlay when the **“i”** map button is clicked.


## Technical Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES modules)
- **Mapping library:** [Leaflet](https://leafletjs.com/)
- **Data source:** [Nextbike API](https://github.com/nextbike/api-doc) (`nextbike-live.json`)


## Key Features

- Live visualisation of **Nextbike stations in Olomouc**.
- **Graduated symbology** (10 classes) to compare relative bike availability between stations.
- Clean, single-page layout with a **full-screen interactive map**.
- Hover-based interaction:
  - No pop-ups; **station details appear in the header** when hovering a marker.
- Intro/info overlay explaining the project, accessible via an **“i” button** on the map.
- Built as a lightweight static site, suitable for **GitHub Pages** deployment.
