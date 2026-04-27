const map = L.map("map");

// 背景地図
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
}).addTo(map);

// 軌跡データ読み込み
fetch("akita-track.geojson")
    .then((response) => response.json())
    .then((data) => {
        // Point を Leaflet 用の [lat, lng] に変換
        const latlngs = data.features.map((feature) => {
            const [lng, lat] = feature.geometry.coordinates;
            return [lat, lng];
        });

        // 軌跡線
        const trackLine = L.polyline(latlngs, {
            color: "#2563eb",
            weight: 4,
            opacity: 0.8
        }).addTo(map);

        // 開始点
        const start = latlngs[0];
        L.circleMarker(start, {
            radius: 7,
            color: "#ffffff",
            weight: 2,
            fillColor: "#16a34a",
            fillOpacity: 1
        })
            .addTo(map)
            .bindPopup("開始点");

        // 終了点
        const end = latlngs[latlngs.length - 1];
        L.circleMarker(end, {
            radius: 7,
            color: "#ffffff",
            weight: 2,
            fillColor: "#dc2626",
            fillOpacity: 1
        })
            .addTo(map)
            .bindPopup("終了点");

        // 全体表示
        map.fitBounds(trackLine.getBounds());
    })
    .catch((error) => {
        console.error("軌跡データの読み込みに失敗しました:", error);
    });
    