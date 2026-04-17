export function formatDistance(kilometers) {
  if (kilometers < 1) {
    return `${Math.round(kilometers * 1000)} m`;
  }

  return `${kilometers.toFixed(1)} km`;
}

export function formatMinutes(minutes) {
  if (minutes < 60) {
    return `${Math.round(minutes)} 分`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return `${hours} 時間 ${remainingMinutes} 分`;
}
