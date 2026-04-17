import { MAP_CONFIG } from '../config.js';
import { ROUTE_COLORS } from '../constants.js';
import { escapeHtml } from '../utils/html.js';

export function createMapView(containerId) {
  const map = createMap(containerId);
  const routeLayerGroup = L.layerGroup().addTo(map);
  const stopLayerGroup = L.layerGroup().addTo(map);
  const spotLayerGroup = L.layerGroup().addTo(map);

  return {
    renderRoutes(routes) {
      routeLayerGroup.clearLayers();

      routes.forEach((route) => {
        if (route.path.length === 0) {
          return;
        }

        L.polyline(route.path, getRouteStyle(route))
          .bindTooltip(route.name, { sticky: true })
          .addTo(routeLayerGroup);
      });
    },

    renderStops(stops) {
      stopLayerGroup.clearLayers();

      stops.forEach((stop) => {
        L.circleMarker([stop.lat, stop.lon], getStopMarkerStyle(stop))
          .bindTooltip(stop.name, { sticky: true })
          .addTo(stopLayerGroup);
      });
    },

    renderSpots(spotViews, onSpotClick) {
      spotLayerGroup.clearLayers();

      spotViews.forEach((spotView) => {
        L.marker([spotView.lat, spotView.lon], { icon: createSpotIcon(spotView) })
          .bindPopup(buildSpotPopupMarkup(spotView))
          .on('click', () => onSpotClick(spotView))
          .addTo(spotLayerGroup);
      });
    },

    setRoutesVisible(visible) {
      toggleLayerGroup(map, routeLayerGroup, visible);
      toggleLayerGroup(map, stopLayerGroup, visible);
    },

    focusSpot(spot) {
      map.flyTo([spot.lat, spot.lon], 12, { duration: 0.8 });
    }
  };
}

function createMap(containerId) {
  const map = L.map(containerId, {
    zoomControl: false,
    minZoom: MAP_CONFIG.minZoom,
    maxZoom: MAP_CONFIG.maxZoom
  }).setView(MAP_CONFIG.center, MAP_CONFIG.zoom);

  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.tileLayer(MAP_CONFIG.tileLayerUrl, {
    attribution: MAP_CONFIG.tileAttribution
  }).addTo(map);

  return map;
}

function getRouteStyle(route) {
  return {
    color: ROUTE_COLORS[route.type] || '#4b6b88',
    weight: route.type === 'train' ? 5 : 4,
    opacity: 0.82,
    dashArray: route.type === 'bus' ? '8 10' : null,
    lineCap: 'round',
    lineJoin: 'round'
  };
}

function getStopMarkerStyle(stop) {
  const isTrain = stop.type === 'train';

  return {
    radius: isTrain ? 5 : 4,
    weight: 2,
    color: 'white',
    fillColor: isTrain ? '#5B6CFF' : '#1DA57A',
    fillOpacity: 0.9
  };
}

function createSpotIcon(spotView) {
  return L.divIcon({
    className: '',
    html: `<div class="custom-marker ${spotView.assessment.scoreId}"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
}

function buildSpotPopupMarkup(spotView) {
  return `
    <div class="popup-card">
      <h3>${escapeHtml(spotView.name)}</h3>
      <p>${escapeHtml(spotView.assessment.scoreLabel)} / 最寄り ${escapeHtml(spotView.assessment.nearestStop.stop.name)}</p>
    </div>
  `;
}

function toggleLayerGroup(map, layerGroup, visible) {
  if (visible) {
    map.addLayer(layerGroup);
    return;
  }

  map.removeLayer(layerGroup);
}
