import { SCORE_TEXTS } from '../constants.js';
import { formatDistance, formatMinutes } from '../utils/format.js';
import { escapeHtml } from '../utils/html.js';

export function createDetailSheet(sheetElement, contentElement, closeButton) {
  closeButton.addEventListener('click', () => {
    sheetElement.classList.add('is-collapsed');
  });

  return {
    show(spotView) {
      contentElement.innerHTML = buildDetailMarkup(spotView);
      sheetElement.classList.remove('is-collapsed');
    },
    hide() {
      sheetElement.classList.add('is-collapsed');
    }
  };
}

function buildDetailMarkup(spotView) {
  const { assessment, meta } = spotView;
  const scoreClass = assessment.scoreId;
  const nearestRail = formatNearestStop(assessment.nearestRailStop);
  const nearestBus = formatNearestStop(assessment.nearestBusStop);
  const summary = meta.summary ? `<p class="summary-text">${escapeHtml(meta.summary)}</p>` : '';
  const tags = buildTagMarkup(meta.tags || []);
  const photosMarkup = buildPhotoMarkup(meta.photos || []);
  const spotInfoMarkup = buildSpotInfoMarkup(meta);

  return `
    <div class="detail-layout">
      <div class="detail-main">
        <div class="spot-title-row">
          <div>
            <h2 class="spot-title">${escapeHtml(spotView.name)}</h2>
            ${summary}
          </div>
          <div class="score-pill ${scoreClass}">
            <span>${escapeHtml(assessment.scoreLabel)}</span>
            <span>${escapeHtml(SCORE_TEXTS[assessment.scoreId])}</span>
          </div>
        </div>

        <div class="meta-grid">
          <article class="meta-card">
            <p class="label">最寄り交通</p>
            <p class="value">${escapeHtml(assessment.nearestStop.stop.name)}</p>
            <p class="subvalue">${escapeHtml(formatDistance(assessment.nearestStop.distanceKm))}</p>
          </article>
          <article class="meta-card">
            <p class="label">徒歩目安</p>
            <p class="value">${escapeHtml(formatMinutes(assessment.walkingMinutes))}</p>
            <p class="subvalue">直線距離換算</p>
          </article>
          <article class="meta-card">
            <p class="label">鉄道最寄り</p>
            <p class="value">${escapeHtml(nearestRail)}</p>
            <p class="subvalue">路線参考</p>
          </article>
          <article class="meta-card">
            <p class="label">バス最寄り</p>
            <p class="value">${escapeHtml(nearestBus)}</p>
            <p class="subvalue">路線参考</p>
          </article>
        </div>

        ${tags}
        ${photosMarkup}
      </div>

      <div class="detail-side">
        <article class="side-card">
          <p class="label">交通メモ</p>
          <p>${escapeHtml(buildTransportMemo(assessment))}</p>
        </article>

        ${spotInfoMarkup}

        <div class="action-grid">
          <article class="action-card">
            <h3>タクシー</h3>
            <p>候補検索へ移動</p>
            <a class="action-button" href="${buildTaxiSearchUrl(spotView)}" target="_blank" rel="noreferrer">開く</a>
          </article>
          <article class="action-card">
            <h3>レンタカー</h3>
            <p>候補検索へ移動</p>
            <a class="action-button" href="${buildRentalSearchUrl(spotView)}" target="_blank" rel="noreferrer">開く</a>
          </article>
        </div>
      </div>
    </div>
  `;
}

function formatNearestStop(nearestStop) {
  return nearestStop
    ? `${nearestStop.stop.name} / ${formatDistance(nearestStop.distanceKm)}`
    : '—';
}

function buildTagMarkup(tags) {
  if (tags.length === 0) {
    return '';
  }

  const markup = tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
  return `<div class="tag-row">${markup}</div>`;
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

  const cards = photos
    .slice(0, 3)
    .map((photo) => {
      const alt = escapeHtml(photo.alt || '観光地写真');
      const src = escapeHtml(photo.src);
      return `
        <article class="photo-card">
          <img src="${src}" alt="${alt}" loading="lazy" />
        </article>
      `;
    })
    .join('');

  return `
    <section>
      <p class="photo-label">Photos</p>
      <div class="photo-grid">${cards}</div>
    </section>
  `;
}

function buildTransportMemo(assessment) {
  if (assessment.scoreId === 'excellent') {
    return '公共交通で立ち寄りやすい候補です。';
  }

  if (assessment.scoreId === 'good') {
    return '公共交通で訪問しやすい候補です。';
  }

  if (assessment.scoreId === 'fair') {
    return '移動前に接続確認があると安心です。';
  }

  return 'タクシーまたはレンタカーを併用する想定に向きます。';
}

function buildTaxiSearchUrl(spotView) {
  return `https://www.google.com/search?q=${encodeURIComponent(`由利本荘 タクシー ${spotView.name}`)}`;
}

function buildRentalSearchUrl(spotView) {
  return `https://www.google.com/search?q=${encodeURIComponent(`由利本荘 レンタカー ${spotView.name}`)}`;
}
