
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
function getRouteShapeOverride(routeId) {
  const overrides = {
    r001: [
      [39.717019357078776, 140.12970761121974],
      [39.6500, 140.0920],
      [39.6030, 140.0690],
      [39.5606999569358, 140.05707812656013],
      [39.54566476958509, 140.0552518744472],
      [39.5150, 140.0565],
      [39.49395278265526, 140.0631584591012],
      [39.4764834117797, 140.09129771491976],
      [39.44221758335088, 140.0907015284102],
      [39.386725361252864, 140.0575877762964],
      [39.347452829776486, 140.01794364189908]
    ],
    r002: [
      [39.230370, 140.139300],
      [39.2404, 140.1307],
      [39.249014, 140.119904],
      [39.268563, 140.114634],
      [39.278385, 140.116432],
      [39.295982, 140.110993],
      [39.312657, 140.112790],
      [39.320988, 140.101679],
      [39.320387, 140.093257],
      [39.328352, 140.071335],
      [39.350740, 140.059555],
      [39.368053, 140.048236],
      [39.386725361252864, 140.0575877762964]
    ],
    r003: [
      [39.222985, 140.068754],
      [39.2158, 140.0744],
      [39.212839, 140.078840],
      [39.2052, 140.0869],
      [39.197912, 140.094123],
      [39.202275, 140.095773],
      [39.204434, 140.100998],
      [39.207972, 140.111087],
      [39.203092, 140.113565],
      [39.2120, 140.1240],
      [39.2200, 140.1320],
      [39.230267, 140.138581],
      [39.232524, 140.138413]
    ]
  };
  return overrides[routeId] || null;
}
function buildMap() {
  const { spots, stops, routes, stopRoutes } = window.APP_DATA;
  const state = window.APP_STATE;
  const map = L.map('map', { zoomControl: false, preferCanvas: true }).setView([39.34, 140.10], 10);
  state.map = map;
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 20
  }).addTo(map);

  const stopById = new Map(stops.map(stop => [stop.stop_id, stop]));
  routes.forEach(route => {
    const orderedStops = stopRoutes.filter(sr => sr.route_id === route.route_id).sort((a,b)=>a.stop_order-b.stop_order).map(sr => stopById.get(sr.stop_id)).filter(Boolean);
    const routeCoords = getRouteShapeOverride(route.route_id) || orderedStops.map(stop=>[stop.lat, stop.lon]);
    if (routeCoords.length >= 2) {
      const lineCoords = routeCoords.length >= 3 ? catmullRomSpline(routeCoords, 10) : routeCoords;
      const layer = L.polyline(lineCoords, {
        color: getRouteColor(route.route_id),
        weight: route.type === 'train' ? 5 : 4,
        opacity: route.type === 'train' ? 0.86 : 0.72,
        lineCap: 'round'
      }).addTo(map);
      layer.bindTooltip(route.name, { sticky: true, className: 'route-tooltip' });
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
