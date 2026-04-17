
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
  const links = buildTravelSearchLinks(spot, evaluation);
  document.getElementById('sheetTag').innerHTML = `<span class="badge ${evaluation.key}">${evaluation.label}</span>`;
  document.getElementById('sheetTitle').textContent = spot.name;
  document.getElementById('sheetSummary').textContent = `最寄りの ${nearestStop.stop.type === 'train' ? '駅' : '停留所'} は ${nearestStop.stop.name}。`;
  updatePhotoCard(spot);
  document.getElementById('nearestStopValue').textContent = nearestStop.stop.name;
  document.getElementById('walkMinutesValue').textContent = `${walkMinutesFromKm(nearestStop.distanceKm)}分`;
  document.getElementById('distanceValue').textContent = formatDistance(nearestStop.distanceKm);
  document.getElementById('alternativeValue').textContent = evaluation.alternative;
  document.getElementById('insightText').textContent = evaluation.note;
  document.getElementById('taxiLink').href = links.taxi;
  document.getElementById('rentalLink').href = links.rental;
  document.getElementById('sourceNote').textContent = formatOfficialRouteSummary();
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
    emptyState.innerHTML = '<h2>地図上の観光地を選択</h2><p>マーカーを選択すると詳細が表示されます。</p>';
  }
}

function updatePhotoCard(spot) {
  const photoCard = document.getElementById('photoCard');
  const spotPhoto = document.getElementById('spotPhoto');
  const photoCaption = document.getElementById('photoCaption');
  const photoCredit = document.getElementById('photoCredit');
  const photos = window.SPOT_PHOTOS || {};
  const photo = photos[spot.spot_id];
  if (!photo || !photo.src) {
    photoCard.classList.add('hidden');
    spotPhoto.removeAttribute('src');
    photoCaption.textContent = '';
    photoCredit.textContent = '';
    return;
  }
  spotPhoto.src = photo.src;
  spotPhoto.alt = photo.alt || `${spot.name} の写真`;
  photoCaption.textContent = photo.caption || spot.name;
  photoCredit.textContent = photo.credit || '';
  photoCard.classList.remove('hidden');
}
