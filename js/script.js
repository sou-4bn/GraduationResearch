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

// 鉄道路線のGeoJSONデータを読み込んで地図に表示
fetch("data/railway.geojson")
  .then((response) => response.json())
  .then((data) => {
    L.geoJSON(data, {
      style: {
        color: "#222222",
        weight: 2,
        opacity: 0.8
      }
    }).addTo(map);
  })
  .catch((error) => {
    console.error("鉄道路線データの読み込みに失敗しました:", error);
  });

// 観光地データを読み込んでリストと地図に表示
fetch("data/spots.json")
  .then((response) => response.json())
  .then((spots) => {
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
  })
  .catch((error) => {
    console.error("spots.json の読み込みに失敗しました:", error);
  });

// 駅データを読み込んで地図に表示
fetch("data/stations.json")
  .then((response) => response.json())
  .then((stations) => {
    stations.forEach((station) => {
      L.circleMarker([station.lat, station.lng], {
        radius: 4,
        color: "#000000",
        fillColor: "#000000",
        fillOpacity: 1,
        weight: 1
      })
        .addTo(map)
        .bindPopup(station.name);
    });
  })
  .catch((error) => {
    console.error("stations.json の読み込みに失敗しました:", error);
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

