# システム構成・データ境界

基準：2026-10-11 main \`41cb70afaf8ef8729cb1e644d3c6cefffce64d2b\`。コード・テストから読み取れる構造を記す。再設計提案と現行事実を混在させない。

## 1. 全体アーキテクチャ

\`\`\`text
GitHub Pages
└─ index.html (画面マークアップ、既存ゲーム状態S、ガチャ、一般人/調査員ナビ)
   ├─ assets/*.css（表現・レスポンシブ）
   ├─ assets/*-model.js（純粋状態遷移が中心）
   ├─ assets/*.js（描画・UI・保存・イベント）
   ├─ assets/{intro,observation,incursions,ui,colleagues}/（画像）
   └─ Firebase Auth / Firestore（接続可能時のみ）
       ├─ users/{uid}（本人の保存・削除済み印）
       └─ scouts/{uid}（調査員活動の集計）
\`\`\`

フロントは**ビルドなしの単一HTML＋複数JS/CSS**。フレームワークへ全面移行する前提ではない。\`index.html\` に巨大なゲームエンジン部分があり、ファイル分割は段階的に進められた。依存関係は \`<script>\` の読み込み順序とグローバル名を共有するため、未検証の単純並び替えは禁止。

## 2. モジュール責務と主な契約

| 系統 | 主なファイル | 現在の責務 |
| --- | --- | --- |
| ゲーム基盤・描画 | \`index.html\` | S、ガチャ・経済・ランク、一般人進行、画面切替、読取、保存通知 |
| 一般人の導入 | \`intro-story.js\` / \`intro-story.css\` | 最初の3通、写真比較、再開、スキップ、段階演出 |
| 観測の状態遷移 | \`observation-model.js\` | v2→v3移行、結果抽選・保持、報酬、接触判定、感度、育成・自動化条件 |
| 観測・課員UI | \`observation.js\` / \`observation.css\` | 観測1シーン、背景切替、フィードバック、機材、会話、回線遮断 |
| 封筒由来の侵入 | \`incursions.js\` / \`incursions.css\` | 100固定ID、発生・手順・完了・育成・再発・図鑑 |
| 真相調査・関連資料 | \`legend-*.js\`、\`investigation*.js\` | 取得済み断片の照合、仮説、再鑑定、合同調査 |
| 日付・不在の痕跡 | \`forecast-archive-model.js\`、\`absence-traces-model.js\` 等 | フィクションの未来報告、離席後の記録、違和感 |
| 課内地位・人事照合 | \`index.html\` の \`CLEARANCE_BANDS\`、\`personnel-discrepancies-model.js\` | 20ランク→6機密区分、3人の証言・照合済み保存 |
| 図鑑 | \`encyclopedia.js\` | 発見済み異変／課員／場所／機密・人事資料の投影 |
| 運営情報と通信 | \`menu.js\` | お知らせ、保存済み受信箱、添付の一回受取、メニュー |
| アカウント | \`account.js\`、\`cloud-save.js\`、\`index.html\` | ゲスト、Google連携、Firestore同期、衝突回避、エクスポート、削除 |
| 安全・画面適合 | \`runtime-safety.js\`、\`scene-fit.js\`、各種CSS | 保存正規化、HTMLエスケープ、映像のフィット、可読性 |

\`-model.js\` はNodeからも呼ばれる部分がある。UIとモデルの責務を混ぜず、抽選・ID・報酬の修正はまずモデル境界で行う。コード側が個別の代替ルートを持つ場合はテストと照合する。

## 3. 状態・永続化の責務

主キーは \`shinso_gacha_state_v1\`。主な下位状態と所有者：

| 状態の例 | どこで管理するか | 維持すべきもの |
| --- | --- | --- |
| \`S.role\` / \`S.lite\` | \`index.html\` + 導入 | 一般人と調査員の境界、36断片、最初の3通 |
| \`S.currency\` / \`S.pulls\` / \`S.levels\` | \`index.html\` | pt、累計回数、黒塗りレベル、ランク |
| \`S.observation\` | WatchModel / UI | version、route、seed、結果保持、記録、装備、心身負荷 |
| \`S.incursion\` | incursions | 100事件のID、証拠、対抗策、重複支給防止 |
| \`S.personnelEvidence\` | PersonnelDiscrepancies | 聞いた人だけの証言、照合確定済み |
| \`S.communications\` | menu | 受信日時、未読、添付受取 |
| \`S.caseLog\` / 調査データ | \`index.html\` / legend系 | 選択と実施時の機密ランク、原本・仮説・照合履歴 |
| アカウント削除・セーブ競合 | account / cloud / Firestore Rules | 書き込み停止、復活防止、ユーザー誤削除防止 |

保存の基本形：\`normalize(旧データ)\` → 検証 → **旧資産を残したまま新フィールドを追加** → 明示的操作時に保存 → リロード再現。乱数によって結果を別物に変えない。複数端末はクライアントだけで原子的排他を保証しないため、本番QAが必要。

## 4. 依存とイベント経路

代表的な連携例：

\`\`\`text
開封操作 → pull / litePull → 消費とアイテム → レベル・証拠 → 保存
                             └→ incursionInvestigate（第0章の保護は別判定）
観測映像タップ → observationCollect → WatchModel.tap/suppress
                                    ├→ 観測報酬・資料・痕跡
                                    └→ 保存・画面描画
課内会話 → observationConversation → 人事証言を保存
                                  → 人物図鑑・人事照合 → ゲーム内受信箱
権限変更 → rankIdx → clearanceForRank → 証拠付記・残留記録・課内人事話題
\`\`\`

表示だけの開閉、再読、図鑑の参照で、報酬や抽選シーケンスを進めない。入口ごとに同じモデルを通す。画像に存在しない異変位置を作らない。

## 5. UIレンダリングの制約

- 状態 → DOMの順に更新。描画時に情報が足りないからと勝手に抽選しない。
- 幅320/390/430、縦・短い横で見出し・CTA・図鑑・資料の重なりを確認。
- 観測映像の座標は**元画像上の正規化座標**。フレームサイズや画像の切り抜きを変えたら接触座標とアクセシブルな3×3位置選択を再検証。
- 画像にテキスト・実際のボタンを焼き込まない。表示言語・検索・スクリーンリーダー・状態切替をHTML側へ。
- \`prefers-reduced-motion\` と観測の演出軽減設定を尊重。怖さは事実関係の矛盾と曖昧さで作り、操作妨害にしない。
- 未取得の人物・事件・正解は、見えないCSSで隠すのでなく**DOMへ作らない**。

## 6. 静的公開・セキュリティ

- 静的配信は GitHub Pages。GitHub ActionsのCIに「smoke」「browser」「webkit」「security-rules」がある。
- \`firebase/firestore.rules\` はPagesのデプロイと連動しない。管理者のFirebase本番承認・手動反映が別に必要。
- \`scripts/update-csp.cjs\` がメインHTMLのインラインスクリプトハッシュを更新し、\`--check\` がCIで一致検査する。HTMLコード変更時は忘れない。
- Firebaseアダプター/エミュレーター試験≠本番ログイン・削除の保証。プレイヤーの本人データを開発QAに使わない。
- クライアントの経済・状態は改ざん可能。ランキングなどの厳密な不正防止が必要になった時点でサーバー権限の設計を見直す。

## 7. 次の整理の方向（提案・未実施）

1. \`index.html\` 内の状態・ビュー・経済をドメイン別に移す。ただし**移行と機能追加を同じPRで混ぜない**。
2. \`S\` の各枝に明示的なバージョンと単体移行テストを設ける。
3. 事件台帳を「固定ID / 登場条件 / 素材 / 正解領域 / 保管 / 再閲覧」まで一意に定義する。
4. 公開ドキュメントに内部デバッグ・QA用データを混入させない。
