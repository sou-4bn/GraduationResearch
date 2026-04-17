const MAP_CONFIG = {
  center: [39.33, 140.09],
  zoom: 10,
  minZoom: 9,
  maxZoom: 16,
  tileLayerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  tileAttribution: '&copy; OpenStreetMap contributors'
};

const ROUTE_COLORS = {
  train: '#5B6CFF',
  bus: '#1DA57A'
};

export function createUI(containerId, filters, onFilterChange, onSpotClick) {
  const elements = {
    searchInput: document.getElementById('spot-search'),
    chipsContainer: document.getElementById('filter-chips'),
    toggleRoutesButton: document.getElementById('toggle-routes-button'),
    detailSheet: document.getElementById('detail-sheet'),
    detailContent: document.getElementById('detail-content'),
    sheetCloseButton: document.getElementById('sheet-close-button')
  };

  const map = L.map(containerId, {
    zoomControl: false,
    minZoom: MAP_CONFIG.minZoom,
    maxZoom: MAP_CONFIG.maxZoom
  }).setView(MAP_CONFIG.center, MAP_CONFIG.zoom);

  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.tileLayer(MAP_CONFIG.tileLayerUrl, { attribution: MAP_CONFIG.tileAttribution }).addTo(map);

  const layers = {
    routes: L.layerGroup().addTo(map),
    stops: L.layerGroup().addTo(map),
    spots: L.layerGroup().addTo(map)
  };

  elements.sheetCloseButton.addEventListener('click', () => {
    elements.detailSheet.classList.add('is-collapsed');
  });

  renderFilterChips(elements.chipsContainer, filters, 'all', onFilterChange);

  return {
    elements,
    renderFilter(activeFilterId) {
      renderFilterChips(elements.chipsContainer, filters, activeFilterId, onFilterChange);
    },
    renderRoutes(routes) {
      layers.routes.clearLayers();
      routes.forEach((route) => {
        if (route.path.length < 2) {
          return;
        }

        L.polyline(route.path, {
          color: ROUTE_COLORS[route.type] || '#4b6b88',
          weight: route.type === 'train' ? 5 : 4,
          opacity: 0.82,
          dashArray: route.type === 'bus' ? '8 10' : null,
          lineCap: 'round',
          lineJoin: 'round'
        })
          .bindTooltip(route.name, { sticky: true })
          .addTo(layers.routes);
      });
    },
    renderStops(stops) {
      layers.stops.clearLayers();
      stops.forEach((stop) => {
        const isTrain = stop.type === 'train';
        L.circleMarker([stop.lat, stop.lon], {
          radius: isTrain ? 5 : 4,
          weight: 2,
          color: 'white',
          fillColor: isTrain ? '#5B6CFF' : '#1DA57A',
          fillOpacity: 0.9
        })
          .bindTooltip(stop.name, { sticky: true })
          .addTo(layers.stops);
      });
    },
    renderSpots(spots) {
      layers.spots.clearLayers();
      spots.forEach((spot) => {
        L.marker([spot.lat, spot.lon], {
          icon: L.divIcon({
            className: '',
            html: `<div class="custom-marker ${spot.assessment.scoreId}"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
        })
          .bindPopup(`
            <div class="popup-card">
              <h3>${escapeHtml(spot.name)}</h3>
              <p>${escapeHtml(spot.assessment.scoreLabel)} / 最寄り ${escapeHtml(spot.assessment.nearestStop.stop.name)}</p>
            </div>
          `)
          .on('click', () => onSpotClick(spot))
          .addTo(layers.spots);
      });
    },
    setRoutesVisible(visible) {
      toggleLayer(map, layers.routes, visible);
      toggleLayer(map, layers.stops, visible);
      elements.toggleRoutesButton.textContent = visible ? '路線表示中' : '路線非表示';
    },
    focusSpot(spot) {
      map.flyTo([spot.lat, spot.lon], 12, { duration: 0.8 });
    },
    showSpotDetails(spot) {
      elements.detailContent.innerHTML = buildDetailMarkup(spot);
      elements.detailSheet.classList.remove('is-collapsed');
    }
  };
}

function renderFilterChips(container, filters, activeFilterId, onChange) {
  container.innerHTML = '';
  filters.forEach((filter) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `chip${filter.id === activeFilterId ? ' is-active' : ''}`;
    button.textContent = filter.label;
    button.addEventListener('click', () => onChange(filter.id));
    container.appendChild(button);
  });
}

function buildDetailMarkup(spot) {
  const { assessment, meta } = spot;
  const routeText = assessment.availableRouteNames.length > 0 ? assessment.availableRouteNames.join(' / ') : '該当なし';

  return `
    <div class="detail-layout">
      <div class="detail-main">
        <div class="spot-title-row">
          <div>
            <h2 class="spot-title">${escapeHtml(spot.name)}</h2>
            ${meta.summary ? `<p class="summary-text">${escapeHtml(meta.summary)}</p>` : ''}
          </div>
          <div class="score-pill ${assessment.scoreId}">
            <span>${escapeHtml(assessment.scoreLabel)}</span>
            <span>${escapeHtml(assessment.scoreText)}</span>
          </div>
        </div>

        <div class="meta-grid compact">
          ${buildMetaCard('最寄り交通', assessment.nearestStop.stop.name, formatDistance(assessment.nearestStop.distanceKm))}
          ${buildMetaCard('徒歩目安', formatMinutes(assessment.walkingMinutes), '直線距離換算')}
          ${buildMetaCard('利用路線', routeText, '最寄り停留所基準')}
        </div>

        ${buildTagMarkup(meta.tags || [])}
        ${buildPhotoMarkup(meta.photos || [])}
      </div>

      <div class="detail-side">
        <article class="side-card">
          <p class="label">交通メモ</p>
          <p>${escapeHtml(buildTransportMemo(assessment.scoreId))}</p>
        </article>

        <article class="side-card">
          <p class="label">最寄り駅・停留所</p>
          <p><strong>鉄道:</strong> ${escapeHtml(formatNearestStop(assessment.nearestRailStop))}</p>
          <p><strong>バス:</strong> ${escapeHtml(formatNearestStop(assessment.nearestBusStop))}</p>
        </article>

        ${buildSpotInfoMarkup(meta)}

        <div class="action-grid">
          <article class="action-card">
            <h3>タクシー</h3>
            <p>候補検索へ移動</p>
            <a class="action-button" href="${buildTaxiSearchUrl(spot.name)}" target="_blank" rel="noreferrer">開く</a>
          </article>
          <article class="action-card">
            <h3>レンタカー</h3>
            <p>候補検索へ移動</p>
            <a class="action-button" href="${buildRentalSearchUrl(spot.name)}" target="_blank" rel="noreferrer">開く</a>
          </article>
        </div>
      </div>
    </div>
  `;
}

function buildMetaCard(label, value, subvalue = '') {
  return `
    <article class="meta-card">
      <p class="label">${escapeHtml(label)}</p>
      <p class="value">${escapeHtml(value)}</p>
      ${subvalue ? `<p class="subvalue">${escapeHtml(subvalue)}</p>` : ''}
    </article>
  `;
}

function formatNearestStop(nearestStop) {
  return nearestStop ? `${nearestStop.stop.name} / ${formatDistance(nearestStop.distanceKm)}` : '—';
}

function buildTagMarkup(tags) {
  if (tags.length === 0) {
    return '';
  }

  return `<div class="tag-row">${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>`;
}

function buildSpotInfoMarkup(meta) {
  if (!meta.hours && !meta.parking && !meta.notes && !meta.website) {
    return '';
  }

  return `
    <article class="side-card">
      <p class="label">スポット情報</p>
      ${meta.hours ? `<p><strong>営業時間:</strong> ${escapeHtml(meta.hours)}</p>` : ''}
      ${meta.parking ? `<p><strong>駐車場:</strong> ${escapeHtml(meta.parking)}</p>` : ''}
      ${meta.notes ? `<p><strong>備考:</strong> ${escapeHtml(meta.notes)}</p>` : ''}
      ${meta.website ? `<p><a href="${escapeHtml(meta.website)}" target="_blank" rel="noreferrer">公式サイト</a></p>` : ''}
    </article>
  `;
}

function buildPhotoMarkup(photos) {
  if (photos.length === 0) {
    return '';
  }

  const cards = photos.slice(0, 3).map((photo) => {
    const src = escapeHtml(photo.src);
    const alt = escapeHtml(photo.alt || '観光地写真');
    return `<article class="photo-card"><img src="${src}" alt="${alt}" loading="lazy" /></article>`;
  }).join('');

  return `<section><p class="photo-label">Photos</p><div class="photo-grid">${cards}</div></section>`;
}

function buildTransportMemo(scoreId) {
  if (scoreId === 'excellent') {
    return '公共交通で立ち寄りやすい候補です。';
  }
  if (scoreId === 'moderate') {
    return '公共交通で訪問しやすいですが、時刻確認があると安心です。';
  }
  return 'タクシーまたはレンタカーの併用も考えたい候補です。';
}

function buildTaxiSearchUrl(name) {
  return `https://www.google.com/search?q=${encodeURIComponent(`由利本荘 タクシー ${name}`)}`;
}

function buildRentalSearchUrl(name) {
  return `https://www.google.com/search?q=${encodeURIComponent(`由利本荘 レンタカー ${name}`)}`;
}

function formatDistance(km) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function formatMinutes(minutes) {
  if (minutes < 60) {
    return `${Math.round(minutes)} 分`;
  }

  const hours = Math.floor(minutes / 60);
  const remaining = Math.round(minutes % 60);
  return `${hours} 時間 ${remaining} 分`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function toggleLayer(map, layer, visible) {
  if (visible) {
    map.addLayer(layer);
    return;
  }
  map.removeLayer(layer);
}
