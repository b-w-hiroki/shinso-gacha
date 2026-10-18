# 真相ガチャ｜GitHub運用パイロット

**状態：pilot（試験導入）／開始 2026-10-16／Issue状態確認 2026-10-18**

この作品では、共通正本 [studio-playbook GitHub Operating Model](https://github.com/b-w-hiroki/studio-playbook/blob/main/docs/GITHUB-OPERATING-MODEL.md) を試す。Private側へアクセスできないAIは「共通契約未読」と報告し、ここで確認できる必要最小限の安全契約に従う。**このページを共通標準の二重正本にしない。**

## 新しいチャットで読む順序

1. [AGENTS.md](../AGENTS.md)、[AI-RESUME](AI-RESUME.md)、最新GitHub **main** SHA、Open PR、同SHAのCI/Pages、Issueと最近の決定コメントを読む。
2. [GitHub作業キュー](https://github.com/b-w-hiroki/shinso-gacha/issues?q=is%3Aissue+is%3Aopen)を調べ、親の[全体ロードマップ #89](https://github.com/b-w-hiroki/shinso-gacha/issues/89)に重複していない子Taskを選ぶ。#89の大量の古い履歴を現在の真実とはしない。
3. **Decision Issue**が未確定なら、その選択に依存するTaskのみBlocked。それ以外は続行してよい。人の承認なしに判断を確定しない。
4. 未検証素材/本番作業/実機はそのまま未完了。既存のコード・保存形式・レアリティ・pt・静かな恐怖演出を守る。ユーザーの現行指示により **手動ブラウザ・スクリーンショットQAは省略**。既存の自動CIは削除・skipせず継続する。
5. Task→PR（`Refs #...`、Issueを完全に閉じられる場合だけ`Fixes #...`）→同head CI→main SHA→Pages→Issue Done を逐次更新。成果をチャットだけに閉じ込めない。

## 作業の分類

- **Task**：作業に着手する単位。目的とDone条件を各Issueに記入。例：車載・教室の生成原本2枚、透過差分6枚とSSRを整合させ、元写真の来歴/台帳を直す。単なる候補生成のPRと区別する。
- **Decision**：AIとユーザーの選択・方針をIssueにまとめ、選択肢、推奨、決定者、判断待ち、採用理由、影響先を明示。
- **Bug/Investigation**：失敗URL、初回失敗、再発率、検証対象SHA、修正結果を残す。

**優先順位**：Issueラベル `priority:p0/p1/p2` を将来の機械読みの正本とする。ラベルを作成できない間は `P1: [Asset]` 等のタイトル接頭辞を使う。無ラベルIssueを `autopilot:ready` として扱わない。秘密/未公開プロットはpublic Issueに記述しない。

## GitHub Projectsについて

最終的にはbirdman studio横断Projectに **全体 / 判断待ち / AI作業 / 実装検証 / 作品別** の5ビューを持つ。Status候補：Backlog、Needs Decision、Ready、In Progress、Review、Blocked、Done。Product、Priority、Type、Decision Owner、Iterationを使う。

**接続先：[birdman studio｜開発ロードマップ](https://github.com/users/b-w-hiroki/projects/1)。** 個人所有のPublic Projectとして運用し、公開可能なIssueだけを登録する。秘密、認証情報、未公開プロットは登録しない。Projectは横断表示、各Issue・PR・main・Actionsは実装状態の一次正本として扱う。

## 本作の現状の正本

- Epic：[#89 全体ロードマップ](https://github.com/b-w-hiroki/shinso-gacha/issues/89)。Issue本文は過去ログが長いため、新しい実行内容は子Taskへ分ける。
- 未完のストーリー・人物：[Issue #82](https://github.com/b-w-hiroki/shinso-gacha/issues/82)
- 不安定性：[Issue #141](https://github.com/b-w-hiroki/shinso-gacha/issues/141)
- 管理権限・実機が必要：[Issue #75](https://github.com/b-w-hiroki/shinso-gacha/issues/75)（human-required、手動ブラウザQAは現在の依頼範囲外）
- 写真差分制作：[観測素材ブリーフ](OBSERVATION-ART-REPLACEMENT-BRIEFS.md)
- [Decision #173：Project所有先・公開範囲](https://github.com/b-w-hiroki/shinso-gacha/issues/173)（個人所有Publicで決定）
- [Task #174：海沿い車載・教室の本番画像統合](https://github.com/b-w-hiroki/shinso-gacha/issues/174)（素材統合はPR #200/#201でmain反映済み。Issueは人によるブラインド検収待ちでOPEN）
- [Task #175：人物専用素材の品質統一](https://github.com/b-w-hiroki/shinso-gacha/issues/175)（CLOSED／完了）
- [Task #176：未来報告と課員証言の分岐](https://github.com/b-w-hiroki/shinso-gacha/issues/176)（CLOSED／完了）
- [Task #177：50案ロードマップの現状仕分け](https://github.com/b-w-hiroki/shinso-gacha/issues/177)（CLOSED／完了）
- [Task #178：Projects v2リンク・ビュー設定](https://github.com/b-w-hiroki/shinso-gacha/issues/178)（CLOSED／完了。Project #1へ接続済み）
- Pilot評価と正式昇格：[studio-playbook #49](https://github.com/b-w-hiroki/studio-playbook/issues/49)。共通ルール [Playbook PR #48](https://github.com/b-w-hiroki/studio-playbook/pull/48)。

## Pilot評価と昇格

最低3つのTask、2回の別チャット再開、ユーザー判断1件、失敗CI1件を対象とする。判断の再質問、二重作業、誤Done、本番無権限操作をゼロにする。ユーザーが承認したら共通Playbookの `phase=pilot` を `phase=adopted` としてPRで更新し、真相ガチャでの運用を保ったまま他タイトルへ段階展開。試験用表示を取り除くこととIssueや判断履歴を消すことは別で、後者は行わない。

この導入だけでGitHub Projects作成・無人AI Coding Agent・GitHub App権限設定・自動マージが起動することはない。

## Issue本文の簡潔化ルール（2026-10-16から試験適用）

- 人間向けIssue本文は原則 **300〜500文字**。「目的（1文）／状態／進捗チェック3〜5件／ブロッカー／次の一手／関連リンク」に限定する。
- 詳細設計・不変条件は `docs/`、変更の根拠はPR、初回CIの生ログはActionsに保存。Issueへ毎回長い検証報告コメントを積み増さない。
- 進捗が変われば短い本文のチェックと状態を更新し、重要な判断のみ簡潔なコメントを残す。AIはリンク先とmainを読んで再開する。
- 既存の長いIssueは削除前に `docs/archive/` に全文保存し、Issueから参照する。**Issueコメント履歴は削除しない**。
- Issueの要約を唯一の技術仕様にせず、Done条件を省略したことで誤Closeしない。未公開情報は公開リポジトリへ移さない。
