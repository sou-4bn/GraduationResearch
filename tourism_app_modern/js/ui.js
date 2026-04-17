
const detailSheet = document.getElementById('detailSheet');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const closeSheetBtn = document.getElementById('closeSheetBtn');
const locateBtn = document.getElementById('locateBtn');

function bindUI() {
  document.querySelectorAll('.chip').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(chip => chip.classList.remove('active'));
      button.classList.add('active');
      applyViewFilter({ filter: button.dataset.filter, query: searchInput.value });
    });
  });
  searchInput.addEventListener('input', () => applyViewFilter({ query: searchInput.value, filter: window.APP_STATE.filter }));
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    applyViewFilter({ query: '', filter: window.APP_STATE.filter });
  });
  closeSheetBtn.addEventListener('click', () => {
    detailSheet.classList.add('hidden');
    window.APP_STATE.selectedSpotId = null;
    applyViewFilter({ query: searchInput.value, filter: window.APP_STATE.filter });
  });
  locateBtn.addEventListener('click', () => fitToData());
}
function showDetail({ spot, nearestStop, evaluation }) {
  document.getElementById('sheetTag').innerHTML = `<span class="badge ${evaluation.key}">${evaluation.label}</span>`;
  document.getElementById('sheetTitle').textContent = spot.name;
  document.getElementById('sheetSummary').textContent = `最寄りの ${nearestStop.stop.type === 'train' ? '駅' : '停留所'} は ${nearestStop.stop.name}。観光地を地図上から直接選んで、アクセスの現実性を確認する構成です。`;
  document.getElementById('nearestStopValue').textContent = nearestStop.stop.name;
  document.getElementById('walkMinutesValue').textContent = `${walkMinutesFromKm(nearestStop.distanceKm)}分`;
  document.getElementById('distanceValue').textContent = formatDistance(nearestStop.distanceKm);
  document.getElementById('alternativeValue').textContent = evaluation.alternative;
  document.getElementById('insightText').textContent = `${evaluation.note} 将来的には Routes API や GTFS を組み合わせて、待ち時間・乗換回数・実所要時間まで拡張できます。`;
  detailSheet.classList.remove('hidden');
  emptyState.style.display = 'none';
}
function syncEmptyState() {
  const state = window.APP_STATE;
  const visibleMarkerCount = Array.from(state.markers.values()).filter(marker => state.map && state.map.hasLayer(marker)).length;
  if (detailSheet.classList.contains('hidden')) emptyState.style.display = visibleMarkerCount ? 'block' : 'none';
  if (!visibleMarkerCount) {
    emptyState.style.display = 'block';
    emptyState.innerHTML = '<h2>該当する観光地がありません</h2><p>検索語またはフィルタ条件を変えると、地図上の候補が更新されます。</p>';
  } else {
    emptyState.innerHTML = '<h2>地図上の観光地を選択</h2><p>観光地を最初から一覧表示せず、地図上から直接選ぶUIにしています。マーカーをタップするとアクセス評価と詳細が出ます。</p>';
  }
}
