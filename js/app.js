<<<<<<< HEAD
import { DATASET } from './data/index.js';
import { buildAppData, FILTERS, filterSpots } from './core.js';
import { createUI } from './ui.js';

const state = {
  searchText: '',
  activeFilterId: 'all',
  selectedSpotId: null,
  areRoutesVisible: true
};

const appData = buildAppData(DATASET);
const ui = createUI('map', FILTERS, handleFilterChange, handleSpotClick);
=======
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
>>>>>>> c33dffb9b6e523fa53ca0eca1774937bc65bed9c

initialize();

function initialize() {
<<<<<<< HEAD
  ui.renderRoutes(appData.routes);
  ui.renderStops(appData.stops);
  ui.renderFilter(state.activeFilterId);
  renderSpots();

  ui.elements.searchInput.addEventListener('input', (event) => {
    state.searchText = event.currentTarget.value.trim();
    renderSpots();
  });

  ui.elements.toggleRoutesButton.addEventListener('click', () => {
    state.areRoutesVisible = !state.areRoutesVisible;
    ui.setRoutesVisible(state.areRoutesVisible);
  });

  ui.setRoutesVisible(state.areRoutesVisible);
}

function renderSpots() {
  ui.renderSpots(filterSpots(appData.spots, state));
=======
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
>>>>>>> c33dffb9b6e523fa53ca0eca1774937bc65bed9c
}

function handleFilterChange(filterId) {
  state.activeFilterId = filterId;
<<<<<<< HEAD
  ui.renderFilter(state.activeFilterId);
  renderSpots();
}

function handleSpotClick(spot) {
  state.selectedSpotId = spot.id;
  ui.focusSpot(spot);
  ui.showSpotDetails(spot);
=======
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
>>>>>>> c33dffb9b6e523fa53ca0eca1774937bc65bed9c
}
