
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
