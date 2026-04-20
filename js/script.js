const spots = [
  {
    name: "法体の滝",
    description: "鳥海山の麓に位置し、三段にわたって流れ落ちるダイナミックな景観と映画のロケ地にもなった美しい自然が魅力の名瀑です。",
    access: "×",
    reason: "公共交通機関がなく、アクセスが非常に困難",
    nearest: "なし",
    alternative: "タクシー利用を推奨",
    lat: 39.10803319918925,
    lng: 140.15929555655893,
    metrics: {
      invehicle: 39,
      wait: 115,
      walk: 310,
      transfer: 0,
      maxWait: 0
    },
    score: 734
  },
  {
    name: "桑ノ木台湿原",
    description: "鳥海山の山麓に広がる広大な湿原で、初夏のレンゲツツジや秋の草紅葉など、季節ごとに移ろう神秘的な絶景を堪能できる由利本荘市屈指の景勝地です。",
    access: "×",
    reason: "公共交通機関がなく、アクセスが非常に困難",
    nearest: "なし",
    alternative: "タクシー利用を推奨",
    lat: 39.17299025422298,
    lng: 140.04624151120456,
    metrics: {
      invehicle: 39,
      wait: 115,
      walk: 244,
      transfer: 0,
      maxWait: 0
    },
    score: 635
  },
  {
    name: "本荘公園",
    description: "本荘藩主六郷氏の居城であった本荘城跡に広がる公園で、春には約1,000本の桜やツツジが咲き誇り、歴史の面影を感じながら四季折々の散策を楽しめる由利本荘市のシンボル的スポットです。",
    access: "〇",
    reason: "徒歩で移動可能",
    nearest: "羽後本荘駅",
    alternative: "不要",
    lat: 39.38471267927984,
    lng: 140.0477778265553,
    metrics: {
      invehicle: 0,
      wait: 0,
      walk: 12,
      transfer: 0,
      maxWait: 0
    },
    score: 18
  }
];

const spotList = document.getElementById("spotList");
const detail = document.getElementById("detail");
let currentSpotName = null;
const map = L.map("map");

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

// GeoJSONデータを読み込んで地図に表示
fetch("data/yurihonjo.geojson")
  .then((response) => response.json())
  .then((data) => {
    const boundaryLayer = L.geoJSON(data, {
      style: {
        color: "#5f7f73",
        weight: 2,
        fillColor: "#a8c3b8",
        fillOpacity: 0.06
      }
    }).addTo(map);

    map.fitBounds(boundaryLayer.getBounds());
  })
  .catch((error) => {
    console.error("境界データの読み込みに失敗しました:", error);
  });

spots.forEach((spot) => {
  const div = document.createElement("div");
  div.className = "spot-item";
  const badgeClass = getBadgeClass(spot.access);

  div.innerHTML = `
    <div class="spot-row">
      <span>${spot.name}</span>
      <span class="badge ${badgeClass}">${spot.access}</span>
    </div>
  `;

  div.addEventListener("click", () => {
    if (detail.style.display === "block" && currentSpotName === spot.name) {
      detail.style.display = "none";
      currentSpotName = null;
    } else {
      showDetail(spot);
    }
  });

  spotList.appendChild(div);

  L.marker([spot.lat, spot.lng])
    .addTo(map)
    .bindPopup(spot.name)
    .on("click", () => {
      if (detail.style.display === "block" && currentSpotName === spot.name) {
        detail.style.display = "none";
        currentSpotName = null;
      } else {
        showDetail(spot);
      }
    });
});

function getBadgeClass(access) {
  if (access === "〇") {
    return "good";
  }
  if (access === "△") {
    return "normal";
  }
  return "bad";
}

// 詳細を表示する関数
function showDetail(spot) {
  detail.style.display = "block";
  detail.innerHTML = `
    <h2>${spot.name}</h2>
    <p>${spot.description}</p>
    <p>
      <strong>評価スコア：</strong>${spot.score}
    </p>
    <p><strong>理由：</strong>${spot.reason}</p>
    <p><strong>最寄り交通機関：</strong>${spot.nearest}</p>
    <p><strong>乗車時間：</strong>${spot.metrics.invehicle}分</p>
    <p><strong>待ち時間：</strong>${spot.metrics.wait}分</p>
    <p><strong>徒歩時間：</strong>${spot.metrics.walk}分</p>
    <p><strong>乗り換え回数：</strong>${spot.metrics.transfer}回</p>
    <p><strong>最長待ち時間：</strong>${spot.metrics.maxWait}分</p>
    <p><strong>代替手段：</strong>${spot.alternative}</p>
  `;
  currentSpotName = spot.name;
}
