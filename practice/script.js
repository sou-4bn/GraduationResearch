const map = L.map("map");

// 背景地図
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
}).addTo(map);

const simplifyRange = document.getElementById("simplifyRange");
const simplifyValue = document.getElementById("simplifyValue");

let allLatlngs = [];
let trackLine = null;
let startMarker = null;
let endMarker = null;

// 軌跡を描画する関数
function drawTrack(step) {
    if (allLatlngs.length === 0) return;

    // step ごとに点を間引く
    const simplifiedLatlngs = allLatlngs.filter((_, index) => index % step === 0);

    // 最後の点が消えないように追加
    const lastLatlng = allLatlngs[allLatlngs.length - 1];
    const lastSimplifiedLatlng = simplifiedLatlngs[simplifiedLatlngs.length - 1];

    if (
        !lastSimplifiedLatlng ||
        lastSimplifiedLatlng[0] !== lastLatlng[0] ||
        lastSimplifiedLatlng[1] !== lastLatlng[1]
    ) {
        simplifiedLatlngs.push(lastLatlng);
    }

    // 前の線を削除
    if (trackLine) {
        map.removeLayer(trackLine);
    }

    // 線を描画
    trackLine = L.polyline(simplifiedLatlngs, {
        color: "#2563eb",
        weight: 4,
        opacity: 0.8
    }).addTo(map);
}

// 軌跡データ読み込み
fetch("akita-track.geojson")
    .then((response) => response.json())
    .then((data) => {
        allLatlngs = data.features.map((feature) => {
            const [lng, lat] = feature.geometry.coordinates;
            return [lat, lng];
        });

        // 開始点
        startMarker = L.circleMarker(allLatlngs[0], {
            radius: 7,
            color: "#ffffff",
            weight: 2,
            fillColor: "#16a34a",
            fillOpacity: 1
        })
            .addTo(map)
            .bindPopup("開始点");

        // 終了点
        endMarker = L.circleMarker(allLatlngs[allLatlngs.length - 1], {
            radius: 7,
            color: "#ffffff",
            weight: 2,
            fillColor: "#dc2626",
            fillOpacity: 1
        })
            .addTo(map)
            .bindPopup("終了点");

        // 初期表示
        drawTrack(Number(simplifyRange.value));
        map.fitBounds(L.latLngBounds(allLatlngs));
    })
    .catch((error) => {
        console.error("軌跡データの読み込みに失敗しました:", error);
    });

// スライダ変更時
simplifyRange.addEventListener("input", () => {
    const step = Number(simplifyRange.value);
    simplifyValue.textContent = step;
    drawTrack(step);
});
