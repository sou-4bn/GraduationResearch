# 手動追加メモ

## 写真を追加する
1. `assets/photos/` に画像を置く
2. `data/spot_photos.js` に `spot_id` ごとの設定を追加する

```js
window.SPOT_PHOTOS = {
  p010: {
    src: 'assets/photos/p010.jpg',
    caption: '法体の滝',
    credit: '撮影: 自分'
  }
};
```

## 路線を追加する
1. `data/routes.csv` に路線を追加
2. `data/stop_routes.csv` に停留所順を追加
3. 必要なら `data/stops.csv` に停留所を追加
4. 線形を細かく整えたい場合は `js/map.js` の `getRouteShapeOverride()` に補助点を追加

## メモ
- 画像なしの観光地は写真欄を表示しません。
- 現状は API を使わない静的構成です。
