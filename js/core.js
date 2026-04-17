const WALKING_SPEED_KM_PER_HOUR = 4.5;
<<<<<<< HEAD
const TRANSFER_WALK_THRESHOLD_KM = 0.6;
const ROUTE_WAIT_MINUTES = {
  train: 18,
  bus: 25
};

const WALKING_THRESHOLDS_MINUTES = {
  good: 10,
  poor: 30
};

const WAITING_THRESHOLDS_MINUTES = {
  good: 20,
  poor: 60
};

const TRANSFER_THRESHOLDS = {
  good: 1,
  poor: 3
=======
const ACCESS_THRESHOLDS_KM = {
  excellent: 1.0,
  moderate: 2.5
>>>>>>> 02eb3690a706c92e48c26f23adcf32750a142e3d
};

export const FILTERS = [
  { id: 'all', label: 'すべて' },
  { id: 'excellent', label: '◎' },
  { id: 'moderate', label: '○' },
<<<<<<< HEAD
  { id: 'poor', label: '×' }
=======
  { id: 'poor', label: '×' },
  { id: 'rail', label: '鉄道周辺' },
  { id: 'bus', label: 'バス周辺' }
>>>>>>> 02eb3690a706c92e48c26f23adcf32750a142e3d
];

export const SCORE_META = {
  excellent: {
    label: '◎',
    text: '行きやすい',
    colorClass: 'excellent'
  },
  moderate: {
    label: '○',
<<<<<<< HEAD
    text: 'やや行きにくい',
=======
    text: 'やや行きやすい',
>>>>>>> 02eb3690a706c92e48c26f23adcf32750a142e3d
    colorClass: 'moderate'
  },
  poor: {
    label: '×',
<<<<<<< HEAD
    text: '行きにくい',
=======
    text: '代替移動向き',
>>>>>>> 02eb3690a706c92e48c26f23adcf32750a142e3d
    colorClass: 'poor'
  }
};

export function buildAppData(dataset) {
  const routesWithStops = buildRoutesWithStops(dataset.routes, dataset.stops, dataset.stopRouteLinks);
  const routesByStopId = buildRoutesByStopId(routesWithStops);
<<<<<<< HEAD
  const transferLinks = buildTransferLinks(dataset.stops);
  const startPoints = buildStartPoints(dataset.stops);
  const spots = dataset.spots.map((spot) => buildSpotView(spot, dataset.spotMeta[spot.id] || {}, dataset.stops));
=======
  const spots = dataset.spots.map((spot) => buildSpotView(spot, dataset.spotMeta[spot.id] || {}, dataset.stops, routesByStopId));
>>>>>>> 02eb3690a706c92e48c26f23adcf32750a142e3d

  return {
    routes: routesWithStops,
    stops: dataset.stops,
<<<<<<< HEAD
    startPoints,
    spots,
    context: {
      routesByStopId,
      transferLinks
    }
  };
}

export function enrichSpotsForStartPoint(spots, startPointId, context) {
  return spots.map((spot) => ({
    ...spot,
    assessment: buildSpotAssessment(spot, startPointId, context)
  }));
}

export function filterSpots(spots, state) {
  return spots.filter((spot) => matchesFilter(spot, state.activeFilterId));
=======
    spots
  };
}

export function filterSpots(spots, state) {
  return spots.filter((spot) => matchesSearch(spot, state.searchText) && matchesFilter(spot, state.activeFilterId));
>>>>>>> 02eb3690a706c92e48c26f23adcf32750a142e3d
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

<<<<<<< HEAD
function buildTransferLinks(stops) {
  const links = new Map(stops.map((stop) => [stop.id, []]));

  for (let index = 0; index < stops.length; index += 1) {
    for (let nextIndex = index + 1; nextIndex < stops.length; nextIndex += 1) {
      const first = stops[index];
      const second = stops[nextIndex];
      const distanceKm = haversineDistanceKm(first, second);
      if (distanceKm > TRANSFER_WALK_THRESHOLD_KM) {
        continue;
      }

      links.get(first.id).push({ stopId: second.id, distanceKm });
      links.get(second.id).push({ stopId: first.id, distanceKm });
    }
  }

  return links;
}

function buildStartPoints(stops) {
  const preferredIds = ['s007', 's010', 's008', 's006', 's020'];
  return preferredIds
    .map((id) => stops.find((stop) => stop.id === id))
    .filter(Boolean)
    .map((stop) => ({ id: stop.id, label: stop.name, stopId: stop.id }));
}

function buildSpotView(spot, meta, stops) {
  const nearestStop = findNearestStop(spot, stops);
  const nearestRailStop = findNearestStop(spot, stops.filter((stop) => stop.type === 'train'));
  const nearestBusStop = findNearestStop(spot, stops.filter((stop) => stop.type === 'bus'));

  return {
    ...spot,
    meta,
    location: {
      nearestStop,
      nearestRailStop,
      nearestBusStop,
      walkingMinutesFromNearestStop: calculateWalkingMinutes(nearestStop?.distanceKm || 0)
    },
    assessment: null
  };
}

function buildSpotAssessment(spot, startPointId, context) {
  const startStopId = startPointId;
  const nearestStop = spot.location.nearestStop;
  const pathAnalysis = findBestPath(startStopId, nearestStop?.stop.id, context.routesByStopId, context.transferLinks);
  const walkingMinutes = spot.location.walkingMinutesFromNearestStop;
  const waitingMinutes = pathAnalysis ? pathAnalysis.waitingMinutes : 0;
  const transferCount = pathAnalysis ? pathAnalysis.transferCount : 0;
  const triggeredIssues = buildTriggeredIssues({ transferCount, waitingMinutes, walkingMinutes });
  const scoreId = getScoreId(triggeredIssues.length);
=======
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
>>>>>>> 02eb3690a706c92e48c26f23adcf32750a142e3d

  return {
    scoreId,
    scoreLabel: SCORE_META[scoreId].label,
    scoreText: SCORE_META[scoreId].text,
<<<<<<< HEAD
    startStopId,
    nearestStop: spot.location.nearestStop,
    nearestRailStop: spot.location.nearestRailStop,
    nearestBusStop: spot.location.nearestBusStop,
    routeNames: pathAnalysis ? pathAnalysis.routeNames : [],
    transferCount,
    waitingMinutes,
    walkingMinutes,
    triggeredIssues,
    reasonSummary: buildReasonSummary(triggeredIssues),
    fallback: buildFallback({ scoreId, transferCount, waitingMinutes, walkingMinutes, spotName: spot.name })
  };
}

function findBestPath(startStopId, targetStopId, routesByStopId, transferLinks) {
  if (!startStopId || !targetStopId || startStopId === targetStopId) {
    return {
      routeNames: [],
      transferCount: 0,
      waitingMinutes: 0
    };
  }

  const queue = [{ stopId: startStopId, routeId: null, transfers: 0, waiting: 0, routeNames: [] }];
  const best = new Map();

  while (queue.length > 0) {
    queue.sort(compareState);
    const current = queue.shift();
    const bestKey = `${current.stopId}:${current.routeId || 'none'}`;

    if (best.has(bestKey) && compareState(best.get(bestKey), current) <= 0) {
      continue;
    }
    best.set(bestKey, current);

    if (current.stopId === targetStopId) {
      return {
        routeNames: current.routeNames,
        transferCount: current.transfers,
        waitingMinutes: current.waiting
      };
    }

    const availableRoutes = routesByStopId.get(current.stopId) || [];
    availableRoutes.forEach((route) => {
      const isSwitchingRoute = current.routeId && current.routeId !== route.id;
      const nextTransfers = current.transfers + (isSwitchingRoute ? 1 : 0);
      const nextWaiting = current.waiting + (isSwitchingRoute || !current.routeId ? ROUTE_WAIT_MINUTES[route.type] || 20 : 0);
      const nextRouteNames = current.routeId === route.id ? current.routeNames : [...current.routeNames, route.name];

      route.stops.forEach((stop) => {
        if (stop.id === current.stopId) {
          return;
        }
        queue.push({
          stopId: stop.id,
          routeId: route.id,
          transfers: nextTransfers,
          waiting: nextWaiting,
          routeNames: nextRouteNames
        });
      });
    });

    (transferLinks.get(current.stopId) || []).forEach((link) => {
      queue.push({
        stopId: link.stopId,
        routeId: null,
        transfers: current.transfers,
        waiting: current.waiting + calculateWalkingMinutes(link.distanceKm),
        routeNames: current.routeNames
      });
    });
  }

  return null;
}

function compareState(a, b) {
  if (a.transfers !== b.transfers) {
    return a.transfers - b.transfers;
  }
  if (a.waiting !== b.waiting) {
    return a.waiting - b.waiting;
  }
  return a.routeNames.length - b.routeNames.length;
}

function buildTriggeredIssues(metrics) {
  const issues = [];

  if (metrics.transferCount >= TRANSFER_THRESHOLDS.poor) {
    issues.push('乗り換え回数が多い');
  } else if (metrics.transferCount > TRANSFER_THRESHOLDS.good) {
    issues.push('乗り換えがやや多い');
  }

  if (metrics.waitingMinutes >= WAITING_THRESHOLDS_MINUTES.poor) {
    issues.push('待ち時間が長い');
  } else if (metrics.waitingMinutes > WAITING_THRESHOLDS_MINUTES.good) {
    issues.push('待ち時間がやや長い');
  }

  if (metrics.walkingMinutes >= WALKING_THRESHOLDS_MINUTES.poor) {
    issues.push('徒歩移動が長い');
  } else if (metrics.walkingMinutes > WALKING_THRESHOLDS_MINUTES.good) {
    issues.push('徒歩移動がやや長い');
  }

  return issues;
}

function getScoreId(issueCount) {
  if (issueCount === 0) {
    return 'excellent';
  }
  if (issueCount === 1) {
    return 'moderate';
  }
  return 'poor';
}

function buildReasonSummary(triggeredIssues) {
  if (triggeredIssues.length === 0) {
    return '公共交通で比較的アクセスしやすい候補です。';
  }

  return triggeredIssues.join('・');
}

function buildFallback({ scoreId, transferCount, waitingMinutes, walkingMinutes, spotName }) {
  if (scoreId === 'excellent') {
    return {
      level: 'none',
      title: '代替手段は不要',
      message: '公共交通を中心に訪問しやすい見込みです。',
      taxiUrl: '',
      rentalUrl: ''
    };
  }

  let type = 'taxi';
  let title = 'タクシー利用を検討';
  let message = '最寄り停留所からの移動負担を減らせます。';

  if (waitingMinutes >= WAITING_THRESHOLDS_MINUTES.poor || transferCount >= TRANSFER_THRESHOLDS.poor) {
    type = 'rental';
    title = 'レンタカー利用を推奨';
    message = '待ち時間や乗り換え負担が大きいため、車移動の方が現実的です。';
  } else if (walkingMinutes >= WALKING_THRESHOLDS_MINUTES.poor) {
    type = 'taxi';
    title = 'タクシー利用が現実的';
    message = '最後の徒歩移動が長いため、区間的な利用が向いています。';
  } else if (scoreId === 'moderate') {
    type = 'either';
    title = '状況に応じて代替移動も有効';
    message = '時刻や天候しだいでタクシーやレンタカーの併用も考えられます。';
  }

  return {
    level: type,
    title,
    message,
    taxiUrl: `https://go.goinc.jp/`,
    rentalUrl: `https://rental.timescar.jp/`,
    label: spotName
  };
}

function matchesFilter(spot, filterId) {
  if (!filterId || filterId === 'all') {
    return true;
  }

  return spot.assessment.scoreId === filterId;
}

=======
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

>>>>>>> 02eb3690a706c92e48c26f23adcf32750a142e3d
function findNearestStop(spot, stops) {
  return stops
    .map((stop) => ({ stop, distanceKm: haversineDistanceKm(spot, stop) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)[0] || null;
}

<<<<<<< HEAD
function calculateWalkingMinutes(distanceKm) {
  return (distanceKm / WALKING_SPEED_KM_PER_HOUR) * 60;
=======
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
>>>>>>> 02eb3690a706c92e48c26f23adcf32750a142e3d
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
