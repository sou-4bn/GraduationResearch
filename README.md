# tourism_app_v4

静的な観光アクセスマップです。
API キーは不要で、`index.html` をブラウザで開くと動きます。

## 主要構成

- `index.html` 画面の骨組み
- `css/style.css` 明るいトーンの UI
- `js/app.js` 初期化と全体フロー
- `js/services/` データ加工と評価ロジック
- `js/ui/` 地図・フィルタ・詳細シート
- `js/data/` 編集しやすいデータ定義
- `data/source/` 元の CSV 参照用

## コードを読む順番

1. `index.html`
2. `js/app.js`
3. `js/services/dataset.js`
4. `js/services/route-builder.js`
5. `js/services/access-evaluator.js`
6. `js/ui/map-view.js`
7. `js/ui/sheet-view.js`
8. `js/data/*.js`

## データを編集する場所

- 観光地の補足情報: `js/data/spot-meta.js`
- ルートの曲がり方補正: `js/data/route-shapes.js`
- 元データ参照: `data/source/*.csv`

## 注意

- 地図タイルは OpenStreetMap を参照しています。
- 所要時間は API 計算ではなく、直線距離からの簡易推定です。
