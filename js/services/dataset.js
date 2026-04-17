import { SPOTS } from '../data/spots.js';
import { STOPS } from '../data/stops.js';
import { ROUTES } from '../data/routes.js';
import { STOP_ROUTE_LINKS } from '../data/stop-route-links.js';
import { SPOT_META } from '../data/spot-meta.js';

export function loadDataset() {
  return {
    spots: SPOTS,
    stops: STOPS,
    routes: ROUTES,
    stopRouteLinks: STOP_ROUTE_LINKS,
    spotMeta: SPOT_META
  };
}
