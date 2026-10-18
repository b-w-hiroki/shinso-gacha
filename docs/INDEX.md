# 真相ガチャ 開発ドキュメント総覧

**再開入口：** [AI-RESUME.md](AI-RESUME.md)。新チャットでも最新main、Open PR、Issue、CIを再取得。基準日時を「現在」として扱わない。

> 基準：2026-10-11、main \`41cb70afaf8ef8729cb1e644d3c6cefffce64d2b\`（PR #96反映時点）。**資料の基準日時であり、将来のmainを自動追跡しない。**
> このセットは実装・既存文書・CI構成・Issueを突き合わせて整理したもの。感情的な恐怖の評価、実機Safari、本番Firebaseの作動は実証していない。

## 最初に読む順番

| 読む人・作業 | 文書 | 何が得られるか |
| --- | --- | --- |
| 全員 | [現行仕様](CURRENT-SPEC.md) | モード、経済、観測、収集、解放条件 |
| 企画・ディレクション | [体験設計](EXPERIENCE-DESIGN.md) | 恐怖の曲線、情報量、UIの判断原則 |
| 開発者・AIエージェント | [システム構成](SYSTEM-ARCHITECTURE.md) | ファイル、状態、依存関係、変更境界 |
| 素材担当 | [素材制作フロー](ASSET-PRODUCTION-WORKFLOW.md) | 分割生成、ID、差分、切り出し、配置、品質確認 |
| PM・AIエージェント | [開発ワークフロー](DEVELOPMENT-WORKFLOW.md) | タスク化、調査→実装→QA→PR→統合 |
| レビュアー・リリース担当 | [QA・公開判定](QA-RELEASE-CHECKLIST.md) | テスト証跡、ブロッカー、実機・本番の区別 |
| 人間の発見性検収 | [観測16画像ブラインドQA](OBSERVATION-BLIND-QA.md) | ランダム順・探すまでの時間・見逃し・誤タップを匿名で評価する手順 |
| 本番管理者・実機QA | [本番Firebase・iPhone検収手順](FIREBASE-PRODUCTION-QA.md) | プロジェクト確認、2端末同期・削除、実機操作、証跡の記録 |
| 他プロジェクトへ転用 | [再利用プレイブック](REUSABLE-PLAYBOOK.md) | 型、転用条件、失敗例、プロンプト |
| 現在の問題と優先順 | [全体監査](IMPLEMENTATION-AUDIT-2026-10-11.md) | 実装/部分実装/未検証の分類、技術・制作負債 |

## 情報源の優先順位

1. 最新の \`main\` のコード・CI・保存移行・実行結果（事実）。
2. このセットの「現行仕様」「構成図」「QA・公開判定」（基準時点での解説）。
3. 個別分野の詳細書：\`OBSERVATION.md\`、\`INCURSIONS.md\`、\`CLEARANCE-PROGRESSION.md\`、\`COLLEAGUES.md\`、\`ACCOUNT-CATALOG.md\` 等。
4. 既存の [SPEC.md](SPEC.md)・[DESIGN.md](DESIGN.md)：創業時の仕様・意思決定・履歴。**現在の実装と異なる記述もある**。
5. Issue・提案・モック：承認済みでも実装・確認済みとは限らない。

同じ話題で矛盾があればコードで確認し、文書を直してPRに理由を記す。「検討した」「作った」「組み込んだ」「テストで動いた」「本番で使えた」は別の状態。

## 仕様の変更方法

- ゲームルール・保存・経済：現行仕様とシステム構成、既存仕様の該当箇所を同じPRで更新。
- UI・演出：体験設計を更新し、320/390pxの前後スクショを付ける。
- 画像・動画・音：素材台帳・使用先・元画像・切出し・QAをセットにする。
- CI・権限・公開：QA・公開判定とSETUPを更新する。
- 新規機能：テスト・コード・該当文書・残タスクを同じPRに載せる。

**Docsだけ変更したPR**は、動作変更がないことを明記し、最低限リンクと構造のチェックを実施する。

## 整理して残す既存資料

- [仕様履歴](SPEC.md) / [意思決定履歴](DESIGN.md)
- [導入](INTRODUCTION.md) / [観測](OBSERVATION.md) / [侵入](INCURSIONS.md)
- [昇進・課内](CLEARANCE-PROGRESSION.md) / [同僚](COLLEAGUES.md)
- [アカウント・図鑑](ACCOUNT-CATALOG.md) / [安全](SECURITY-REVIEW.md)
- [本番セットアップ](SETUP.md) / [体験検証の限界](RELEASE-EXPERIENCE-QA.md)
- [素材組込みの履歴](ASSET_INTEGRATION.md) / [写実UI素材](PHYSICAL_ASSETS.md)
- [2026-10-19素材の外周ノイズ点検・改善17項目](ASSET-NOISE-AUDIT-2026-10-19.md)
- [未完タスク](https://github.com/b-w-hiroki/shinso-gacha/issues/89)

削除や全面書換えで歴史を消さない。古い記述には「当時の判断」の印を付ける。
