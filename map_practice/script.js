// 地図初期化
var map = L.map('map').setView([39.3, 140.1], 10);

// 背景地図
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 観光地データ
var spots = [
  {name:"ハーブワールドAKITA", lat:39.3577502, lon:140.0119945},
  {name:"桑ノ木台湿原", lat:39.1731566, lon:140.0466492},
  {name:"ボツメキ湧水", lat:39.2344225, lon:140.2383997},
  {name:"滝ケ原湿原", lat:39.1297044, lon:140.067375},
  {name:"八塩山", lat:39.2365862, lon:140.2276806}
];

// レイヤー
var spotLayer = L.layerGroup();
var markers = [];

// マーカー生成
spots.forEach(function(s){
  var marker = L.marker([s.lat, s.lon])
    .bindPopup("<b>" + s.name + "</b>");
  
  spotLayer.addLayer(marker);
  markers.push(marker);
});

// 地図に追加
spotLayer.addTo(map);

// 範囲自動調整
var group = L.featureGroup(markers);
map.fitBounds(group.getBounds());

// ON/OFF制御
document.getElementById("toggleSpots").addEventListener("change", function(e){
  if(e.target.checked){
    map.addLayer(spotLayer);
  } else {
    map.removeLayer(spotLayer);
  }
});
