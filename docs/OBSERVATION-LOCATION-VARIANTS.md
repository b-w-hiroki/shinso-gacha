# 追加観測4地点の異変レイヤーと保存

基準：2026-10-11、最新mainの `WatchLocations` を拡張する方式。従来4方式とメディア別保存を廃止しない。

## 実装

- 監視（地下通路）、写真（夜の教室）、視界（踏切前）、車載（海沿いの夜道）。PR #103が登録した `alt:{mode}` の訪問IDをそのまま利用。
- 追加地点のNは既存WebP。R/SR/SSRは同じWebPをベースに12枚の透明SVGを独立レイヤーで重ねる。平常/異変で別場所の写真に切り替えず、同じカメラ/位置を維持する。
- 追加地点の違和感は独立した `WatchLocations.TARGETS[mode][rarity]` で管理。12 SVGの `data-hotspots` と中心座標を一致させ、地点に合わせて当たり判定半径を調整する。旧地点は `WatchModel.TARGETS` のまま保持する。手動接触・3×3代替選択・自動鎮静が同じ地点の判定を使う。
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

## 二地点間の原本照合（2026-10-11）

- `assets/location-correlations-model.js` は追加4地点の **取得済み二地点** から、相互照合できる6通りの架空の業務記録を投影する。どの地点にも再抽選、追加報酬、訪問数変更はない。
- 図鑑「場所」の取得済み地点詳細にのみ「別の観測記録と照合する」を表示。対応する別地点も実際に発見済みでなければ、名称・資料・画像をDOMへ出さない。
- 取得済みの2枚の原本を並べた専用シートで、同一受領印／記録番号など第六文書課内の不合理を比較。入手したレアリティが両地点で一致する場合は一文追加。未取得のレアリティを先に見せない。
- 比較結果の新規保存キーは作らず、既存 `locationRecords` の読取専用の投影にする。閲覧・再読・再ロードにptや進行の副作用を持たせない。
- `tests/location-correlations-model.cjs` / `tests/location-correlations.cjs` で未取得秘匿、二地点必須、複数地点、320/390/844px、戻る導線、画像デコード、状態不変を確認。

## 2026-10-11: メディアの読み込みと素材品質の検証

- 二地点原本照合の2枚の画像は遅延読み込みをやめ、`loading="eager"` で先に読み込む。CIでは `img.complete` と `naturalWidth/Height` を確認する。WebKitが古い画像読み込みを打ち切る `EncodingError: Aborted by source change` が画像欠落を意味しない場合にも、単なるテストskipで済ませず原本2枚が実際に揃うことを確認する。
- 待機中の観測シーケンス変更でも、実際に選ばれる地点に合わせて画面を再描画する。異変率・観測抽選・旧セーブ・報酬は変更しない。
- `tests/observation-photo-asset-audit.cjs` はGitHubにある4枚のWebPを読み、デコード可能なRIFFの構造・寸法・比率・容量・個別のファイル名を検査する。
- **品質の監査と素材の完成を混同しない**。1200×600未満の元画像は `LOW_RES_SOURCE_REQUIRES_NEW_ART` とCIログへ出す。これは過去の画像を勝手に生成・引き伸ばしたり、既に高解像度になったと誤認するのを防ぐ品質ゲート。なお既存画像を即時にCI失敗とするものではなく、Issue #81は新規高解像度原画を本当に配置・実ブラウザで比較するまで未完了。

## 2026-10-12：地点ごとの接触領域を独立化

- 追加地点4種 × R/SR/SSR = 12状態で、中心位置は素材上の痕跡と一致させたまま、接触半径を個別に定義。
- 結果の抽選・平常/異変の発生確率・ポイント・既存の `collection[mode:rarity]`・`locationRecords`・保存済みシーケンスを変えない。
- スクリーンリーダー等の場所選択、自動鎮静、通常の画面接触で同じ判定。新旧両方の記録と旧セーブ、リロードを検証。
- これにより新画像の高解像度差し替え後は独立地点の当たり判定だけ調整可能。**写真の解像度そのものは未改善**であり、本Issueの画像品質要件は未完のまま。
