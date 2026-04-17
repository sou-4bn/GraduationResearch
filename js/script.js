const spots = [
  {
    name: "法体の滝",
    description: "日本の滝百選にも選ばれていて、滝つぼ周辺は広い園地になっているほか、滝の上流部の「玉田渓谷」は、「甌穴」をはじめ見所いっぱいのトレッキングコースになっています。",
    access: "×",
    reason: "最寄り交通機関から距離があり、不便です。",
    nearest: "矢島駅",
    alternative: "タクシー利用を推奨",
    lat: 39.10803319918925,
    lng: 140.15929555655893
  },
  {
    name: "鳥海山木のおもちゃ館",
    description: "鳥海山 木のおもちゃ館は、国登録有形文化財であり地域の方に長年愛され、守られ続けてきた「旧鮎川小学校」をそのままの形で残しながら、2018年7月に設立されました。",
    access: "△",
    reason: "移動は可能ですが、乗り換えや移動時間がやや多いです。",
    nearest: "鮎川駅",
    alternative: "鉄道利用",
    lat: 39.33378776522905, 
    lng: 140.06587322655378
  },
  {
    name: "鳥海高原矢島スキー場",
    description: "全部で６つのコースがあり、最長コースは1,300m。初級者から上級者まで楽しめる設計となっています。",
    access: "△",
    reason: "移動は可能ですが、乗り換えや移動時間がやや多いです。",
    nearest: "濁川バス停",
    alternative: "バス利用",
    lat: 39.19035400335526,
    lng: 140.09311791708552
  }
];

const spotList = document.getElementById("spotList");

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
    const badgeClass = getBadgeClass(spot.access);

    detail.innerHTML = `
      <h2>${spot.name}</h2>
      <p>${spot.description}</p>
      <p>
        <strong>アクセス評価：</strong>
        <span class="badge ${badgeClass}">${spot.access}</span>
      </p>
      <p><strong>理由：</strong>${spot.reason}</p>
      <p><strong>最寄り交通機関：</strong>${spot.nearest}</p>
      <p><strong>代替手段：</strong>${spot.alternative}</p>
    `;
  });

  spotList.appendChild(div);
});

const map = L.map("map").setView([39.3900, 140.0500], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

spots.forEach((spot) => {
  L.marker([spot.lat, spot.lng])
    .addTo(map)
    .bindPopup(spot.name);
});

function getBadgeClass(access) {
  if (access === "◎") {
    return "good";
  }
  if (access === "△") {
    return "normal";
  }
  return "bad";
}
