const spots = [
  {
    name: "法体の滝",
    description: "鳥海山の麓に位置し、三段にわたって流れ落ちるダイナミックな景観と映画のロケ地にもなった美しい自然が魅力の名瀑です。",
    access: "×",
    reason: "",
    nearest: "なし",
    alternative: "タクシー利用を推奨",
    lat: 39.10803319918925,
    lng: 140.15929555655893
  },
  {
    name: "桑ノ木台湿原",
    description: "鳥海山の山麓に広がる広大な湿原で、初夏のレンゲツツジや秋の草紅葉など、季節ごとに移ろう神秘的な絶景を堪能できる由利本荘市屈指の景勝地です。",
    access: "△",
    reason: "",
    nearest: "なし",
    alternative: "タクシー利用を推奨",
    lat: 39.17299025422298,
    lng: 140.04624151120456
  },
  {
    name: "本荘公園",
    description: "本荘藩主六郷氏の居城であった本荘城跡に広がる公園で、春には約1,000本の桜やツツジが咲き誇り、歴史の面影を感じながら四季折々の散策を楽しめる由利本荘市のシンボル的スポットです。",
    access: "〇",
    reason: "",
    nearest: "羽後本荘駅",
    alternative: "鉄道利用",
    lat: 39.38471267927984,
    lng: 140.0477778265553
  }
];

const spotList = document.getElementById("spotList");
const map = L.map("map").setView([39.38586, 140.04883], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

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

  L.marker([spot.lat, spot.lng])
    .addTo(map)
    .bindPopup(spot.name);
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
