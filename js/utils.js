
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
function toRad(v) { return (v * Math.PI) / 180; }
function walkMinutesFromKm(km) { return Math.round((km / 4.5) * 60); }
function classifySpot(distanceKm) {
  if (distanceKm <= 1.0) return { key: 'good', label: '◎ 行きやすい', note: '公共交通からの徒歩到達が比較的しやすい地点です。', alternative: '徒歩中心' };
  if (distanceKm <= 2.5) return { key: 'mid', label: '△ やや不便', note: '到達は可能ですが、徒歩が長く、体感的にはやや不便です。', alternative: '徒歩＋タクシー検討' };
  return { key: 'hard', label: '× 要代替手段', note: '公共交通だけでは厳しめで、タクシーやレンタカー提示が妥当です。', alternative: 'タクシー / レンタカー' };
}
function formatDistance(distanceKm) {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)}m`;
  return `${distanceKm.toFixed(1)}km`;
}
function getRouteColor(routeId) {
  if (routeId === 'r001') return '#3f7cff';
  if (routeId === 'r002') return '#2cc985';
  return '#ff9f66';
}
function catmullRomSpline(points, segments = 12) {
  if (points.length < 3) return points;
  const result = [];
  const pts = [points[0], ...points, points[points.length - 1]];
  for (let i = 0; i < pts.length - 3; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const p2 = pts[i + 2];
    const p3 = pts[i + 3];
    for (let j = 0; j < segments; j++) {
      const t = j / segments;
      const t2 = t * t;
      const t3 = t2 * t;
      const lat = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2*p0[0] - 5*p1[0] + 4*p2[0] - p3[0]) * t2 + (-p0[0] + 3*p1[0] - 3*p2[0] + p3[0]) * t3);
      const lon = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2*p0[1] - 5*p1[1] + 4*p2[1] - p3[1]) * t2 + (-p0[1] + 3*p1[1] - 3*p2[1] + p3[1]) * t3);
      result.push([lat, lon]);
    }
  }
  result.push(points[points.length - 1]);
  return result;
}
function buildTravelSearchLinks(spot, evaluation) {
  const query = encodeURIComponent(`${spot.name} ${spot.lat},${spot.lon}`);
  const taxi = `https://www.google.com/maps/search/?api=1&query=${query}+タクシー`;
  const rental = `https://www.google.com/maps/search/?api=1&query=${query}+レンタカー`;
  return { taxi, rental };
}
function formatOfficialRouteSummary() {
  const catalog = window.routeCatalog || { rail: [], routeBus: [], communityBus: [] };
  return `公式サイト掲載: 鉄道 ${catalog.rail.length} 件 / 路線バス ${catalog.routeBus.length} 件 / 市コミバス ${catalog.communityBus.length} 件`;
}
