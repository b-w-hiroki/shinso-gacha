# 真相ガチャ｜固定ナビと観測育成の実タップ回帰（ベンチマークの正例）

対象：birdman studioの共通A/B固定課題 `shinso-nav-click-01`。Playbookの共通評価条件はprivate正本で管理。本ドキュメントは**作品側の実ブラウザQA契約**だけを定義する。

## 由来と限界

- 過去の観測：固定ナビと操作ターゲットの重なりによりアップグレード操作が妨げられた[CI #38197626223](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38197626223)。
- 本テストは現行の修正済み画面が正しく触れることを確かめる**positive-control**。過去の壊れたSHAで旧状態を再現する検証や、AIモデルのA/B実行ではない。
- 受け入れ基準：320×568、390×844、844×390、Chromium/WebKitそれぞれで観測画面の「機材・育成」を**実タッチ**→観測装備画面の育成を**実タッチ**。クリックをJS側から発火しない。ボタン中心のelementFromPoint、44px以上の操作領域、画面外・隠蔽なしをチェックする。
- 初期1000pt／保持Lv0→購入1回後965pt／Lv1、横はみ出しなし。明示保存後の再ロードでもpt／Lvが保持されること。
- CIに実スクリーンショットbefore/afterをartifactとして残す。Chromium/WebKitとも実画像を目視確認すること。PNGが出た事実だけでモック忠実度を宣言しない。
- 実Firebase複数端末同期、日常的な自動保存タイミング、iPhone Safari実機、旧保存からの全移行は**この単独テストの証明範囲外**。

## 実行

```sh
npm install --no-save --package-lock=false playwright@1.62.1
npx playwright install --with-deps chromium webkit
node tests/benchmark-nav-upgrade.cjs
QA_WEBKIT=1 node tests/benchmark-nav-upgrade.cjs
```

GitHub Actions [Benchmark nav-upgrade real-touch QA](../.github/workflows/benchmark-nav-upgrade.yml) は各ブラウザを独立ジョブで実行する。失敗は既存assertを外して通さないこと。過去の失敗SHAを再現できるようになったら、比較実験で使用する前に別に証拠を固定する。
