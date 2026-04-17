<<<<<<< HEAD
import { DATASET } from './data/index.js';
import { buildAppData, enrichSpotsForStartPoint, FILTERS } from './core.js';
import { createUI } from './ui.js';

const baseData = buildAppData(DATASET);

const state = {
  activeFilterId: 'all',
  selectedSpotId: null,
  areRoutesVisible: true,
  startPointId: baseData.startPoints[0]?.stopId || ''
};

const ui = createUI({
  containerId: 'map',
  filters: FILTERS,
  startPoints: baseData.startPoints,
  onFilterChange: handleFilterChange,
  onSpotClick: handleSpotClick,
  onStartPointChange: handleStartPointChange
});
=======
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
>>>>>>> 02eb3690a706c92e48c26f23adcf32750a142e3d

initialize();

function initialize() {
<<<<<<< HEAD
  ui.renderRoutes(baseData.routes);
  ui.renderStops(baseData.stops);
  ui.renderFilter(state.activeFilterId);
  ui.renderStartPoints(state.startPointId);
  renderSpots();

=======
<<<<<<< HEAD
  ui.renderRoutes(appData.routes);
  ui.renderStops(appData.stops);
  ui.renderFilter(state.activeFilterId);
  renderSpots();

  ui.elements.searchInput.addEventListener('input', (event) => {
    state.searchText = event.currentTarget.value.trim();
    renderSpots();
  });

>>>>>>> 02eb3690a706c92e48c26f23adcf32750a142e3d
  ui.elements.toggleRoutesButton.addEventListener('click', () => {
    state.areRoutesVisible = !state.areRoutesVisible;
    ui.setRoutesVisible(state.areRoutesVisible);
  });

  ui.setRoutesVisible(state.areRoutesVisible);
<<<<<<< HEAD
}

function renderSpots() {
  const enriched = enrichSpotsForStartPoint(baseData.spots, state.startPointId, baseData.context);
  const filtered = enriched.filter((spot) => state.activeFilterId === 'all' || spot.assessment.scoreId === state.activeFilterId);
  ui.renderSpots(filtered);
  ui.renderSummary(filtered, enriched, state.startPointId);

  if (state.selectedSpotId) {
    const selected = enriched.find((spot) => spot.id === state.selectedSpotId);
    if (selected) {
      ui.showSpotDetails(selected);
      return;
    }
  }

  ui.clearSpotDetails();
=======
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
>>>>>>> 02eb3690a706c92e48c26f23adcf32750a142e3d
}

function handleFilterChange(filterId) {
  state.activeFilterId = filterId;
<<<<<<< HEAD
  ui.renderFilter(state.activeFilterId);
  renderSpots();
}

function handleStartPointChange(startPointId) {
  state.startPointId = startPointId;
  renderSpots();
}

function handleSpotClick(spot) {
  state.selectedSpotId = spot.id;
  ui.focusSpot(spot);
  ui.showSpotDetails(spot);
=======
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
>>>>>>> 02eb3690a706c92e48c26f23adcf32750a142e3d
}
