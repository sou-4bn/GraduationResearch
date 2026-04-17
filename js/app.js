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

initialize();

function initialize() {
  ui.renderRoutes(baseData.routes);
  ui.renderStops(baseData.stops);
  ui.renderFilter(state.activeFilterId);
  ui.renderStartPoints(state.startPointId);
  renderSpots();

  ui.elements.toggleRoutesButton.addEventListener('click', () => {
    state.areRoutesVisible = !state.areRoutesVisible;
    ui.setRoutesVisible(state.areRoutesVisible);
  });

  ui.setRoutesVisible(state.areRoutesVisible);
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
}

function handleFilterChange(filterId) {
  state.activeFilterId = filterId;
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
}
