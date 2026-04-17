import { state } from './state.js';
import { loadDataset } from './services/dataset.js';
import { buildRoutesWithStops, buildRoutesByStopId } from './services/route-builder.js';
import { buildSpotAssessment } from './services/access-evaluator.js';
import { createMapView } from './ui/map-view.js';
import { createDetailSheet } from './ui/sheet-view.js';
import { renderFilterChips } from './ui/filter-bar.js';

const dataset = loadDataset();
const routesWithStops = buildRoutesWithStops(dataset.routes, dataset.stops, dataset.stopRouteLinks);
const routesByStopId = buildRoutesByStopId(routesWithStops);

const enrichedSpots = dataset.spots.map((spot) => ({
  ...spot,
  meta: dataset.spotMeta[spot.id] || {},
  assessment: buildSpotAssessment(spot, dataset.stops, routesByStopId)
}));

const mapView = createMapView('map');
const detailSheet = createDetailSheet(
  document.getElementById('detail-sheet'),
  document.getElementById('detail-content'),
  document.getElementById('sheet-close-button')
);

const searchInput = document.getElementById('spot-search');
const chipsContainer = document.getElementById('filter-chips');
const toggleRoutesButton = document.getElementById('toggle-routes-button');

initialize();

function initialize() {
  mapView.renderRoutes(routesWithStops);
  mapView.renderStops(dataset.stops);
  renderFilterChips(chipsContainer, state.activeFilterId, handleFilterChange);
  renderSpotMarkers();
  wireEvents();
}

function wireEvents() {
  searchInput.addEventListener('input', (event) => {
    state.searchText = event.currentTarget.value.trim();
    renderSpotMarkers();
  });

  toggleRoutesButton.addEventListener('click', () => {
    state.areRoutesVisible = !state.areRoutesVisible;
    mapView.setRoutesVisible(state.areRoutesVisible);
    toggleRoutesButton.textContent = state.areRoutesVisible ? '路線' : '路線 off';
  });
}

function handleFilterChange(filterId) {
  state.activeFilterId = filterId;
  renderFilterChips(chipsContainer, state.activeFilterId, handleFilterChange);
  renderSpotMarkers();
}

function renderSpotMarkers() {
  const visibleSpots = getVisibleSpots(enrichedSpots, state.searchText, state.activeFilterId);

  mapView.renderSpots(visibleSpots, (spotView) => {
    state.selectedSpotId = spotView.id;
    mapView.focusSpot(spotView);
    detailSheet.show(spotView);
  });
}

function getVisibleSpots(spots, searchText, activeFilterId) {
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
