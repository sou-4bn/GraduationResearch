import { ACCESS_THRESHOLDS_KM, WALKING_SPEED_KM_PER_HOUR } from '../constants.js';
import { haversineDistanceKm } from '../utils/geo.js';

export function buildSpotAssessment(spot, stops, routesById) {
  const nearestStop = findNearestStop(spot, stops);
  const nearestRailStop = findNearestStopByType(spot, stops, 'train');
  const nearestBusStop = findNearestStopByType(spot, stops, 'bus');

  const walkingMinutes = (nearestStop.distanceKm / WALKING_SPEED_KM_PER_HOUR) * 60;
  const scoreId = getScoreId(nearestStop.distanceKm);
  const suggestedTransport = scoreId === 'poor' ? 'alternative' : 'public';

  return {
    spotId: spot.id,
    nearestStop,
    nearestRailStop,
    nearestBusStop,
    walkingMinutes,
    scoreId,
    scoreLabel: getScoreLabel(scoreId),
    suggestedTransport,
    availableRouteNames: collectRouteNames(nearestStop.stop.id, routesById)
  };
}

function findNearestStop(spot, stops) {
  return stops
    .map((stop) => ({
      stop,
      distanceKm: haversineDistanceKm(spot, stop)
    }))
    .sort((left, right) => left.distanceKm - right.distanceKm)[0];
}

function findNearestStopByType(spot, stops, type) {
  const typedStops = stops.filter((stop) => stop.type === type);
  return typedStops.length ? findNearestStop(spot, typedStops) : null;
}

function getScoreId(distanceKm) {
  if (distanceKm <= ACCESS_THRESHOLDS_KM.excellent) {
    return 'excellent';
  }

  if (distanceKm <= ACCESS_THRESHOLDS_KM.good) {
    return 'good';
  }

  if (distanceKm <= ACCESS_THRESHOLDS_KM.fair) {
    return 'fair';
  }

  return 'poor';
}

function getScoreLabel(scoreId) {
  const labels = {
    excellent: '◎',
    good: '○',
    fair: '△',
    poor: '×'
  };

  return labels[scoreId];
}

function collectRouteNames(stopId, routesById) {
  const routeNames = (routesById.get(stopId) || []).map((route) => route.name);
  return Array.from(new Set(routeNames));
}
