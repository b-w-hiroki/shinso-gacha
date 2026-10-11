# 追加観測4地点の異変レイヤーと保存

基準：2026-10-11、最新mainの `WatchLocations` を拡張する方式。従来4方式とメディア別保存を廃止しない。

## 実装

- 監視（地下通路）、写真（夜の教室）、視界（踏切前）、車載（海沿いの夜道）。PR #103が登録した `alt:{mode}` の訪問IDをそのまま利用。
- 追加地点のNは既存WebP。R/SR/SSRは同じWebPをベースに12枚の透明SVGを独立レイヤーで重ねる。平常/異変で別場所の写真に切り替えず、同じカメラ/位置を維持する。
- 違和感の位置は既存 `WatchModel.TARGETS[mode][rarity]` の正規化座標と一致する。画像本体と接触領域の同期を維持し、3×3代替選択でも同じ異変を対処可能。
- `assets/observation-location-model.js` が場所と訪問時刻を管理。今後の訪問はN/R/SR/SSRの獲得数を `rarities` として記録。古いPR #103の `{visits,lastSequence,firstAt}` は `rarities:{0:visits}` として読み取り、実績を消さない。
- 新しい場所の図鑑は獲得済みの場所・獲得済みの各レアリティだけ公開。再閲覧ではpt、ガチャ、観測回収数、異変率を増減しない。未取得のタイトルや絵はDOMへ出さない。
- 4方式の循環と `collection[mode:rarity]` は変えない。新規ランダム抽選は行わず、既存のシーケンスの奇数番を別地点として扱う。

## 素材台帳

|媒体|平常基準|異変R|異変SR|異変SSR|
|---|---|---|---|---|
|監視|cctv-underground-upgraded.webp|alt-overlays/cctv-1.svg|cctv-2.svg|cctv-3.svg|
|写真|photo-classroom-upgraded.webp|alt-overlays/photo-1.svg|photo-2.svg|photo-3.svg|
|視界|vision-crossing-upgraded.webp|alt-overlays/vision-1.svg|vision-2.svg|vision-3.svg|
|車載|dash-coast-road-upgraded.webp|alt-overlays/dash-1.svg|dash-2.svg|dash-3.svg|

以上は **WebP上の独立SVG異変レイヤー**であり、高解像度の写実的な画像4×4セット完成ではない。低刺激/OS reduced motionでは差分を消さず、アニメ・点滅のみ停止する。

## 検証

`tests/observation-location-model.cjs`、`tests/observation-location-variants.cjs`、`tests/observation.cjs` および既存回帰。320×568、390×844、844×390。新地点のRを実際に回収し、別地点の図鑑と再読込を確認する。

## 引き続き必要

1. 現在480×240/320×160の元WebPを高解像度化し、画面内の文字焼き込みを修正。
2. SVGレイヤーより精細な、ベースから同カメラ・同光源で編集したフォトリアルR/SR/SSR画像差分。
3. iPhone Safari実機操作、Firebase実アカウント同期/削除確認、長期プレイにおける異変バランス。
