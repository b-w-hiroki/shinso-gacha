# 真相ガチャ｜AI開発再開入口

**新しいチャットでは「真相ガチャ、開発再開」で開始。** 過去の長い引き継ぎプロンプトは不要。このページは固定の入口であり、過去のSHAや進捗を現在の事実として固定しない。

## 正本
- 作品仕様・変更境界：[`AGENTS.md`](../AGENTS.md)、[仕様書総覧](INDEX.md)、[CURRENT-SPEC](CURRENT-SPEC.md)、[DEVELOPMENT-WORKFLOW](DEVELOPMENT-WORKFLOW.md)。
- 共通の手順：[birdman studio Chat Resume Contract](https://github.com/b-w-hiroki/studio-playbook/blob/main/docs/CHAT-RESUME.md)（Private、GitHub接続の認可要）。アクセスできなければ「未読」とする。
- Issueキュー：[Open Issues](https://github.com/b-w-hiroki/shinso-gacha/issues?q=is%3Aissue+is%3Aopen)、[ロードマップ #89](https://github.com/b-w-hiroki/shinso-gacha/issues/89)、[本番・実機QA #75](https://github.com/b-w-hiroki/shinso-gacha/issues/75)。
- Open PR：[一覧](https://github.com/b-w-hiroki/shinso-gacha/pulls)。最新CI：[Actions](https://github.com/b-w-hiroki/shinso-gacha/actions/workflows/smoke.yml)。[Pages](https://github.com/b-w-hiroki/shinso-gacha/actions)／[公開サイト](https://shinso-gacha.birdman-studio.com/)。
- read-only最新状況：[dev-resume-context Actions](https://github.com/b-w-hiroki/shinso-gacha/actions/workflows/dev-resume-context.yml)。成功した最新runの `dev-resume-context` artifactは**参考スナップショット**。実装前には必ずGitHubからmain/Issue/PR/CIを再確認する。

## 毎回の起動契約
1. GitHubで対象repoの最新main SHA、Open PR、Open Issueと新しいコメント、直近PR、同じmain SHAの必須CIとPagesを読む。古い会話・この文書より優先。
2. #89と個別Issueを照合し、P0→P1→P2、既存PR・既実装との重複を避ける。人の実機・本番権限を要するIssueは `human-required` 扱いとして別に記録し、自動完了にしない。
3. 取得済み資料のみに秘密を表示。保存/報酬/固定ID/希少度とホラーの静かなトーンを維持。390×844基準、Chromium/WebKit/Firestore・実タップ・スクショを検証。
4. 分割PR→CI成功→許可された場合のみマージ→main CI・Pagesを照合。失敗原因と残件をGitHub Issueへ保存。
5. 新チャットでの中断・再開時も、この固定入口に戻る。調査・PR作成・マージはチャットセッションまたは認可済みワーカーが実際に開始した時だけ実行する。

## タスク自動選定の実態
- read-only Actionsはmain/CI/PR/Issueを取得するだけ。**AIコードを書いたりマージしたりしない**。
- `autopilot:ready` のopt-in・未完了チェックがあるIssueだけ自動ワーカーの候補にできる。存在しなければ `triage_required` を返し、勝手に実装開始しない。
- ユーザーがチャットで「真相ガチャ、開発再開」と依頼した場合は、最新情報に基づく安全な優先タスクをそのセッション内で自走する。本番認証・端末など権限のない項目は残件とする。
- プロセス改善は本作のIssueへ証拠を残し、ジャンルを超えて再現できる改善だけPrivateのPlaybookに提案する。
