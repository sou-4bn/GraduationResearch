import { MAP_CONFIG } from '../config.js';
import { ROUTE_COLORS } from '../constants.js';

export function createMapView(containerId) {
  const map = L.map(containerId, {
    zoomControl: false,
    minZoom: MAP_CONFIG.minZoom,
    maxZoom: MAP_CONFIG.maxZoom
  }).setView(MAP_CONFIG.center, MAP_CONFIG.zoom);

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  L.tileLayer(MAP_CONFIG.tileLayerUrl, {
    attribution: MAP_CONFIG.tileAttribution
  }).addTo(map);

  const routeLayerGroup = L.layerGroup().addTo(map);
  const stopLayerGroup = L.layerGroup().addTo(map);
  const spotLayerGroup = L.layerGroup().addTo(map);

  return {
    map,
    routeLayerGroup,
    stopLayerGroup,
    spotLayerGroup,
    renderRoutes(routes) {
      routeLayerGroup.clearLayers();

      routes.forEach((route) => {
        if (!route.path.length) {
          return;
        }

        L.polyline(route.path, {
          color: ROUTE_COLORS[route.type] || '#4b6b88',
          weight: route.type === 'train' ? 5 : 4,
          opacity: 0.82,
          dashArray: route.type === 'bus' ? '8 10' : null,
          lineCap: 'round',
          lineJoin: 'round'
        }).bindTooltip(route.name, { sticky: true }).addTo(routeLayerGroup);
      });
    },
    renderStops(stops) {
      stopLayerGroup.clearLayers();

      stops.forEach((stop) => {
        const radius = stop.type === 'train' ? 5 : 4;
        const color = stop.type === 'train' ? '#5B6CFF' : '#1DA57A';

        L.circleMarker([stop.lat, stop.lon], {
          radius,
          weight: 2,
          color: 'white',
          fillColor: color,
          fillOpacity: 0.9
        })
          .bindTooltip(stop.name, { sticky: true })
          .addTo(stopLayerGroup);
      });
    },
    renderSpots(spotViews, onSpotClick) {
      spotLayerGroup.clearLayers();

      spotViews.forEach((spotView) => {
        const icon = L.divIcon({
          className: '',
          html: `<div class="custom-marker ${spotView.assessment.scoreId}"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        L.marker([spotView.lat, spotView.lon], { icon })
          .bindPopup(`
            <div class="popup-card">
              <h3>${spotView.name}</h3>
              <p>${spotView.assessment.scoreLabel} / 最寄り ${spotView.assessment.nearestStop.stop.name}</p>
            </div>
          `)
          .on('click', () => onSpotClick(spotView))
          .addTo(spotLayerGroup);
      });
    },
    setRoutesVisible(visible) {
      if (visible) {
        map.addLayer(routeLayerGroup);
        map.addLayer(stopLayerGroup);
        return;
      }

      map.removeLayer(routeLayerGroup);
      map.removeLayer(stopLayerGroup);
    },
    focusSpot(spot) {
      map.flyTo([spot.lat, spot.lon], 12, { duration: 0.8 });
    }
  };
}
