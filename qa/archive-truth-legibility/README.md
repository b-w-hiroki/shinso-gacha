# 資料棚・真相到達カードの可読性修正

## 目的と境界
真相到達した資料が暗背景へ沈み、名称が読めない問題を修正する。最新main cd276b0 を基準に、画像・キャラ・固定ID・保存・報酬・解放条件は変更しない。Refs #89。人による恐怖評価、本番Firebase、実機Safariは対象外。

## 原因と変更
`.truth` がカードと印鑑に共用され、印鑑用の `mix-blend-mode:multiply` と mask がカード全体にも適用されていた。乗算で紙地まで暗い背景色と合成される。カードだけ対象外にし、印鑑の質感は維持した。真相印は既存の外部CSSによる本文後の配置を維持する（初回QAでは外部CSS未適用であったため、この配置を新規修正と誤認したが、最終差分から除外した）。

## 確認
- 同一のローカル保存 fixture (u1/u2真相到達・u3調査中) で320×844 / 390×844 のbefore/after画像を取得・目視比較。
- `tests/archive-truth-legibility.cjs`: 両幅でcardのmaskなし/通常合成/印鑑が通常フロー/viewportに収まるcard幅/詳細を開閉できることを検証。
- smoke、UI atmosphere asset、CSP check、spec-design sync、documentation contract pass。
- 全ブラウザ回帰・CI・公開・実機はこのローカル記録では未確認。
- 初回QAで横overflowを検出したが、原因はテストサーバーがCSSを誤ったMIMEで配信していたこと。text/cssへ修正し、全ローカルstylesheetの読み込みとページscrollWidthを追加検証。320/390pxともoverflowなし。初回画像は破棄し、正しいCSS適用後に再撮影した。

## 画像
比較画像はローカルQA成果物（このPRには画像バイナリを含めない）。320は既存の単列、390は既存の2列を維持。
