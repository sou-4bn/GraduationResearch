
function createPoiIcon(isActive = false, isDim = false) {
  return L.divIcon({
    className: '',
    html: `<div class="poi-marker${isActive ? ' is-active' : ''}${isDim ? ' is-dim' : ''}"></div>`,
    iconSize: isActive ? [28, 28] : [22, 22],
    iconAnchor: isActive ? [14, 14] : [11, 11]
  });
}
function createStopIcon() {
  return L.divIcon({
    className: '',
    html: '<div class="stop-marker"></div>',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
}
function buildMap() {
  const { spots, stops, routes, stopRoutes } = window.APP_DATA;
  const state = window.APP_STATE;
  const map = L.map('map', { zoomControl: false, preferCanvas: true }).setView([39.34, 140.10], 10);
  state.map = map;
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 20
  }).addTo(map);

  const stopById = new Map(stops.map(stop => [stop.stop_id, stop]));
  routes.forEach(route => {
    const ordered = stopRoutes.filter(sr => sr.route_id === route.route_id).sort((a,b)=>a.stop_order-b.stop_order).map(sr => stopById.get(sr.stop_id)).filter(Boolean).map(stop=>[stop.lat, stop.lon]);
    if (ordered.length >= 2) {
      const layer = L.polyline(ordered, {
        color: route.route_id === 'r001' ? '#5dd8ff' : route.route_id === 'r002' ? '#82f7c6' : '#b38fff',
        weight: 4,
        opacity: 0.75,
        lineCap: 'round'
      }).addTo(map);
      state.routeLayers.push(layer);
    }
  });

  stops.forEach(stop => {
    const marker = L.marker([stop.lat, stop.lon], { icon: createStopIcon(), keyboard: false, zIndexOffset: 50 }).addTo(map);
    marker.bindTooltip(`${stop.name}`, { direction: 'top', opacity: 0.9 });
    state.stopMarkers.push(marker);
  });

  spots.forEach(spot => {
    const marker = L.marker([spot.lat, spot.lon], { icon: createPoiIcon(), zIndexOffset: 400 }).addTo(map);
    marker.on('click', () => selectSpot(spot.spot_id));
    state.markers.set(spot.spot_id, marker);
  });

  fitToData();
  syncEmptyState();
}
function getNearestStop(spot) {
  const { stops } = window.APP_DATA;
  let best = null;
  stops.forEach(stop => {
    const distanceKm = haversineKm(spot.lat, spot.lon, stop.lat, stop.lon);
    if (!best || distanceKm < best.distanceKm) best = { stop, distanceKm };
  });
  return best;
}
function selectSpot(spotId) {
  const { spots } = window.APP_DATA;
  const state = window.APP_STATE;
  state.selectedSpotId = spotId;
  updateMarkerStyles();
  const spot = spots.find(item => item.spot_id === spotId);
  const nearestStop = getNearestStop(spot);
  const evaluation = classifySpot(nearestStop.distanceKm);
  showDetail({ spot, nearestStop, evaluation });
  state.map.flyTo([spot.lat, spot.lon], 12, { duration: 0.55 });
}
function applyViewFilter({ query = window.APP_STATE.query, filter = window.APP_STATE.filter } = {}) {
  const { spots } = window.APP_DATA;
  const state = window.APP_STATE;
  state.query = query.trim().toLowerCase();
  state.filter = filter;
  spots.forEach(spot => {
    const nearest = getNearestStop(spot);
    const evaluation = classifySpot(nearest.distanceKm);
    const queryMatch = !state.query || spot.name.toLowerCase().includes(state.query);
    const filterMatch = state.filter === 'all' || state.filter === evaluation.key;
    const visible = queryMatch && filterMatch;
    const marker = state.markers.get(spot.spot_id);
    if (!marker) return;
    if (visible) {
      if (!state.map.hasLayer(marker)) marker.addTo(state.map);
    } else if (state.map.hasLayer(marker)) {
      state.map.removeLayer(marker);
    }
  });
  updateMarkerStyles();
  syncEmptyState();
}
function updateMarkerStyles() {
  const { spots } = window.APP_DATA;
  const state = window.APP_STATE;
  spots.forEach(spot => {
    const marker = state.markers.get(spot.spot_id);
    if (!marker || !state.map.hasLayer(marker)) return;
    const isActive = spot.spot_id === state.selectedSpotId;
    const isDim = !!state.selectedSpotId && !isActive;
    marker.setIcon(createPoiIcon(isActive, isDim));
  });
}
function fitToData() {
  const { spots } = window.APP_DATA;
  const coords = spots.map(spot => [spot.lat, spot.lon]);
  if (coords.length) window.APP_STATE.map.fitBounds(coords, { padding: [80, 80] });
}
