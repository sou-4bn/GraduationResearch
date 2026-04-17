import { state } from './state.js';
import { loadDataset } from './services/dataset.js';
import { buildRoutesWithStops, buildRoutesByStopId } from './services/route-builder.js';
import { enrichSpots, filterSpots } from './services/spot-builder.js';
import { createMapView } from './ui/map-view.js';
import { createDetailSheet } from './ui/sheet-view.js';
import { renderFilterChips } from './ui/filter-bar.js';

const dataset = loadDataset();
const routesWithStops = buildRoutesWithStops(dataset.routes, dataset.stops, dataset.stopRouteLinks);
const routesByStopId = buildRoutesByStopId(routesWithStops);
const enrichedSpots = enrichSpots(dataset.spots, dataset.spotMeta, dataset.stops, routesByStopId);

const elements = getElements();
const mapView = createMapView('map');
const detailSheet = createDetailSheet(
  elements.detailSheet,
  elements.detailContent,
  elements.sheetCloseButton
);

initialize();

function initialize() {
  mapView.renderRoutes(routesWithStops);
  mapView.renderStops(dataset.stops);
  renderFilterChips(elements.chipsContainer, state.activeFilterId, handleFilterChange);
  renderSpotMarkers();
  wireEvents();
}

function getElements() {
  return {
    searchInput: document.getElementById('spot-search'),
    chipsContainer: document.getElementById('filter-chips'),
    toggleRoutesButton: document.getElementById('toggle-routes-button'),
    detailSheet: document.getElementById('detail-sheet'),
    detailContent: document.getElementById('detail-content'),
    sheetCloseButton: document.getElementById('sheet-close-button')
  };
}

function wireEvents() {
  elements.searchInput.addEventListener('input', handleSearchInput);
  elements.toggleRoutesButton.addEventListener('click', handleRouteVisibilityToggle);
}

function handleSearchInput(event) {
  state.searchText = event.currentTarget.value.trim();
  renderSpotMarkers();
}

function handleRouteVisibilityToggle() {
  state.areRoutesVisible = !state.areRoutesVisible;
  mapView.setRoutesVisible(state.areRoutesVisible);
  elements.toggleRoutesButton.textContent = state.areRoutesVisible ? '路線' : '路線 off';
}

function handleFilterChange(filterId) {
  state.activeFilterId = filterId;
  renderFilterChips(elements.chipsContainer, state.activeFilterId, handleFilterChange);
  renderSpotMarkers();
}

function renderSpotMarkers() {
  const visibleSpots = filterSpots(enrichedSpots, {
    searchText: state.searchText,
    activeFilterId: state.activeFilterId
  });

  mapView.renderSpots(visibleSpots, handleSpotClick);
}

function handleSpotClick(spotView) {
  state.selectedSpotId = spotView.id;
  mapView.focusSpot(spotView);
  detailSheet.show(spotView);
}
