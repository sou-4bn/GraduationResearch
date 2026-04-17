# コード読解ガイド

## 最初の 30 分で見る範囲

- `index.html`
- `js/app.js`
- `js/services/access-evaluator.js`
- `js/ui/map-view.js`

## 読むときの見方

### 1. 入口をつかむ
`js/app.js` で何を読み込み、どの順で初期化しているかを見る。

### 2. データの流れをつかむ
`dataset.js` で元データをまとめ、`route-builder.js` で路線と停留所を結び、`access-evaluator.js` で観光地の評価を作る。

### 3. 表示の流れをつかむ
`map-view.js` は地図に描画する責務だけを持つ。`sheet-view.js` は詳細カードの HTML を作る責務だけを持つ。

## 理解のコツ

- 1 回目は関数名だけ追う
- 2 回目で引数と戻り値を見る
- 3 回目で分岐とループを見る
- 分からない値は `console.log` で確認する
