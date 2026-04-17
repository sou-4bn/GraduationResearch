export function buildRoutesWithStops(routes, stops, stopRouteLinks) {
  const stopsById = new Map(stops.map((stop) => [stop.id, stop]));
  const stopLinksByRouteId = groupStopLinksByRouteId(stopRouteLinks);

  return routes.map((route) => {
    const orderedStops = (stopLinksByRouteId.get(route.id) || [])
      .sort((left, right) => left.stopOrder - right.stopOrder)
      .map((link) => stopsById.get(link.stopId))
      .filter(Boolean);

    return {
      ...route,
      stops: orderedStops,
      path: buildRoutePath(orderedStops)
    };
  });
}

export function buildRoutesByStopId(routesWithStops) {
  const map = new Map();

  routesWithStops.forEach((route) => {
    route.stops.forEach((stop) => {
      const list = map.get(stop.id) || [];
      list.push(route);
      map.set(stop.id, list);
    });
  });

  return map;
}

function groupStopLinksByRouteId(stopRouteLinks) {
  const groups = new Map();

  stopRouteLinks.forEach((link) => {
    const list = groups.get(link.routeId) || [];
    list.push(link);
    groups.set(link.routeId, list);
  });

  return groups;
}

function buildRoutePath(orderedStops) {
  return orderedStops.map((stop) => [stop.lat, stop.lon]);
}
