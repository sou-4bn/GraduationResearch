const WALKING_SPEED_KM_PER_HOUR = 4.5;
const ACCESS_THRESHOLDS_KM = {
  excellent: 1.0,
  moderate: 2.5
};

export const FILTERS = [
  { id: 'all', label: 'すべて' },
  { id: 'excellent', label: '◎' },
  { id: 'moderate', label: '○' },
  { id: 'poor', label: '×' },
  { id: 'rail', label: '鉄道周辺' },
  { id: 'bus', label: 'バス周辺' }
];

export const SCORE_META = {
  excellent: {
    label: '◎',
    text: '行きやすい',
    colorClass: 'excellent'
  },
  moderate: {
    label: '○',
    text: 'やや行きやすい',
    colorClass: 'moderate'
  },
  poor: {
    label: '×',
    text: '代替移動向き',
    colorClass: 'poor'
  }
};

export function buildAppData(dataset) {
  const routesWithStops = buildRoutesWithStops(dataset.routes, dataset.stops, dataset.stopRouteLinks);
  const routesByStopId = buildRoutesByStopId(routesWithStops);
  const spots = dataset.spots.map((spot) => buildSpotView(spot, dataset.spotMeta[spot.id] || {}, dataset.stops, routesByStopId));

  return {
    routes: routesWithStops,
    stops: dataset.stops,
    spots
  };
}

export function filterSpots(spots, state) {
  return spots.filter((spot) => matchesSearch(spot, state.searchText) && matchesFilter(spot, state.activeFilterId));
}

function buildRoutesWithStops(routes, stops, stopRouteLinks) {
  const stopsById = new Map(stops.map((stop) => [stop.id, stop]));
  const linksByRouteId = new Map();

  stopRouteLinks.forEach((link) => {
    const list = linksByRouteId.get(link.routeId) || [];
    list.push(link);
    linksByRouteId.set(link.routeId, list);
  });

  return routes.map((route) => {
    const orderedStops = (linksByRouteId.get(route.id) || [])
      .sort((a, b) => a.stopOrder - b.stopOrder)
      .map((link) => stopsById.get(link.stopId))
      .filter(Boolean);

    return {
      ...route,
      stops: orderedStops,
      path: orderedStops.map(toLatLng)
    };
  });
}

function buildRoutesByStopId(routes) {
  const map = new Map();

  routes.forEach((route) => {
    route.stops.forEach((stop) => {
      const list = map.get(stop.id) || [];
      list.push(route);
      map.set(stop.id, list);
    });
  });

  return map;
}

function buildSpotView(spot, meta, stops, routesByStopId) {
  const assessment = buildSpotAssessment(spot, stops, routesByStopId);
  return {
    ...spot,
    meta,
    assessment
  };
}

function buildSpotAssessment(spot, stops, routesByStopId) {
  const nearestStop = findNearestStop(spot, stops);
  const nearestRailStop = findNearestStop(spot, stops.filter((stop) => stop.type === 'train'));
  const nearestBusStop = findNearestStop(spot, stops.filter((stop) => stop.type === 'bus'));
  const scoreId = getScoreId(nearestStop.distanceKm);

  return {
    scoreId,
    scoreLabel: SCORE_META[scoreId].label,
    scoreText: SCORE_META[scoreId].text,
    nearestStop,
    nearestRailStop,
    nearestBusStop,
    walkingMinutes: (nearestStop.distanceKm / WALKING_SPEED_KM_PER_HOUR) * 60,
    availableRouteNames: Array.from(new Set((routesByStopId.get(nearestStop.stop.id) || []).map((route) => route.name))),
    suggestedTransport: scoreId === 'poor' ? 'alternative' : 'public'
  };
}

function getScoreId(distanceKm) {
  if (distanceKm <= ACCESS_THRESHOLDS_KM.excellent) {
    return 'excellent';
  }

  if (distanceKm <= ACCESS_THRESHOLDS_KM.moderate) {
    return 'moderate';
  }

  return 'poor';
}

function findNearestStop(spot, stops) {
  return stops
    .map((stop) => ({ stop, distanceKm: haversineDistanceKm(spot, stop) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)[0] || null;
}

function matchesSearch(spot, searchText = '') {
  if (!searchText) {
    return true;
  }

  const search = searchText.toLowerCase();
  const haystack = [spot.name, spot.meta.summary, ...(spot.meta.tags || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(search);
}

function matchesFilter(spot, filterId) {
  if (!filterId || filterId === 'all') {
    return true;
  }

  if (['excellent', 'moderate', 'poor'].includes(filterId)) {
    return spot.assessment.scoreId === filterId;
  }

  if (filterId === 'rail') {
    return spot.assessment.nearestStop.stop.type === 'train';
  }

  if (filterId === 'bus') {
    return spot.assessment.nearestStop.stop.type === 'bus';
  }

  return true;
}

function toLatLng(item) {
  return [item.lat, item.lon];
}

function haversineDistanceKm(pointA, pointB) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(pointB.lat - pointA.lat);
  const dLon = toRadians(pointB.lon - pointA.lon);
  const lat1 = toRadians(pointA.lat);
  const lat2 = toRadians(pointB.lat);

  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}
