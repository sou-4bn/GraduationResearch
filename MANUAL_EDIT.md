# 手動編集メモ

## 写真を追加する

1. `assets/photos/` に画像ファイルを入れる
2. `js/data/spot-meta.js` の対象スポットを編集する

```js
"p001": {
  "photos": [
    { "src": "./assets/photos/herb-world-1.jpg", "alt": "ハーブワールドAKITA" }
  ]
}
```

## スポット説明を追加する

`js/data/spot-meta.js` の `summary`, `tags`, `hours`, `parking`, `website`, `notes` を編集する。

## 路線の形を寄せる

`js/data/route-shapes.js` に補助点を追加する。
開始点と終了点は自動で路線の先頭停留所・終点停留所が使われる。

```js
"r003": [
  { "lat": 39.245, "lon": 140.205 },
  { "lat": 39.258, "lon": 140.185 }
]
```

## 手を入れると良い順番

1. `spot-meta.js`
2. `route-shapes.js`
3. 必要なら `js/data/*.js`
