Map View (Beta)

- Displays current search results on an OSM map using Leaflet via CDN.
- Automatically shows simple grid-based clusters when there are more than 50 results.
- Syncs with filters because it reads the same `useSpotStore().spots` data as the list.

Notes
- No API keys required. Uses public OpenStreetMap tiles.
- BBox parameter is supported in `/api/spots/external` via `bbox=minLon,minLat,maxLon,maxLat`, but UI does not yet reload on map move.
- Coordinates are supplied by Overpass (OSM) and added to each spot when available.

Next Steps
- Reload results on map move/zoom with `bbox`.
- Hover/selection sync between list and map.
- Replace grid clustering with proper spatial clustering if needed.
