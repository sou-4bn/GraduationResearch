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

initialize();

function initialize() {
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
}

function handleFilterChange(filterId) {
  state.activeFilterId = filterId;
  ui.renderFilter(state.activeFilterId);
  renderSpots();
}

function handleSpotClick(spot) {
  state.selectedSpotId = spot.id;
  ui.focusSpot(spot);
  ui.showSpotDetails(spot);
}
