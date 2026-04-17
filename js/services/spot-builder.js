import { buildSpotAssessment } from './access-evaluator.js';

export function enrichSpots(spots, spotMetaById, stops, routesByStopId) {
  return spots.map((spot) => ({
    ...spot,
    meta: spotMetaById[spot.id] || {},
    assessment: buildSpotAssessment(spot, stops, routesByStopId)
  }));
}

export function filterSpots(spots, { searchText = '', activeFilterId = 'all' } = {}) {
  return spots.filter((spot) => matchesSearch(spot, searchText) && matchesFilter(spot, activeFilterId));
}

function matchesSearch(spot, searchText) {
  if (!searchText) {
    return true;
  }

  const normalizedSearchText = searchText.toLowerCase();
  const haystack = [spot.name, spot.meta.summary, ...(spot.meta.tags || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(normalizedSearchText);
}

function matchesFilter(spot, activeFilterId) {
  if (activeFilterId === 'all') {
    return true;
  }

  if (['excellent', 'good', 'fair', 'poor'].includes(activeFilterId)) {
    return spot.assessment.scoreId === activeFilterId;
  }

  if (activeFilterId === 'rail') {
    return spot.assessment.nearestStop.stop.type === 'train';
  }

  if (activeFilterId === 'bus') {
    return spot.assessment.nearestStop.stop.type === 'bus';
  }

  return true;
}
