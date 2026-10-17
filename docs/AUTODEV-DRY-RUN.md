# 小規模自動開発：手動 dry-run 制御

## 現在の到達点

第一段階は `workflow_dispatch` で人が開始する **読み取り専用の計画器**。最新main、open Issue/PR、CIを既存の `scripts/dev-resume.mjs` で読み、`autopilot:ready`、`priority:p0/p1/p2`、未完了チェックをすべて持つIssueを最大1件だけ選ぶ。コード実装、隔離環境、テスト、ブランチ、PR、マージ、公開は開始しない。

## 実効する境界

- 対象は `b-w-hiroki/shinso-gacha` と取得時のmain SHAに固定する。別repo、Decision、Epic、monitoring、人手・本番専用Issueは既存resume判定で除外する。open PRによる除外は、完了を表す `Fixes/Closes/Resolves #N` または行全体が `Autodev-Target: #N` の明示所有マーカーに限定する。一般の `Refs #N` は部分作業や文脈参照なのでロックにしない。
- 同時runはrepository単位のconcurrencyで直列化する。選定結果は `repository#issue-N@mainSHA` のrun keyとJSON artifactへ14日保存する。同一run keyの再計画は無害で、実装を二重起動しない。
- stop/resumeはartifactのJSONを次の手動dispatchへ渡す。別repo、main SHA更新、run key・Issue URL・必須usage・上限・実行無効フラグの不整合、別Issue、承認解除はfail closed。mainが進んだ場合は古い状態を継続せず、最新mainで `plan` からやり直す。stop後もresume後も実装は開始しない。
- `previous_state_json` は人が貼り付ける**未認証の入力**であり、署名済み永続状態やleaseではない。構造・値の整合は厳格に検査するが、改変されていないこと自体は証明しない。この経路を実装ワーカーの権限根拠には使わない。
- workflow timeoutは5分、試行上限は1、実装ワーカー・外部モデル/API費用上限は0 USD。状態が試行1回、5分、対象費用0 USD超を示すresumeは拒否する。現在は実行器も費用計測器もないため、0 USDは「実装ワーカーと有料AI/APIを起動しない」ことだけを意味する。GitHub Actionsのrunner利用、artifact保存等の料金を0と保証しない。
- GitHub権限はcontents/issues/pull requests/actionsのreadだけ。Secrets、Issue更新、ブランチpush、PR作成、merge、Pages/Firebase操作の権限を持たない。

## 手動試行

1. GitHub Actionsの `Autodev controller dry-run` を `plan` で起動する。
2. summaryと `autodev-state-<run id>` artifactを確認する。承認済みIssueがなければ `triage_required` が正常結果。
3. 停止を試す場合はartifact内のJSONを `previous_state_json` に貼り、`stop` で再実行する。
4. 再開を試す場合は停止結果のJSONを渡して `resume` する。同じIssueが引き続き適格な場合だけ `resume_ready` になるが、実装は始まらない。

このPRで実行したのは、ローカルfixtureテストと、CLIから公開GitHub APIを読むlive read-only `plan` 試行だけ。`Autodev controller dry-run` workflow自体はdefault branchに未導入のため未実行であり、PR CIのsmokeがworkflow定義と制御ロジックを検証している。workflowの手動 `plan/stop/resume` は、レビュー後に人が導入を判断してから別々に確認する。

## 未実装（実装済みと扱わない）

- Issueから隔離ワークスペースを作り、モデルへ実装を依頼する実行基盤
- 実装・テストの再試行を横断して管理する永続ストアとlease
- モデル、CI、外部APIの実費を取得して強制停止する計測・課金連携
- 証拠をPR本文へ保存しDraft PRを作るGitHub write経路
- 人のレビュー後にready-for-reviewへ変更する操作。自動merge・main直書き・公開は将来も別承認

次段階へ進む前に、コード変更を要求しない専用のfixture Issueを別途作るか選び、そのIssueが無害な制御試験だけであることを人が確認してから `autopilot:ready` を付ける。#193はこのPRの実装Issueであり、残作業を再確認せずfixtureとして使わない。fixtureを所有するopen PRがある場合は本文に `Autodev-Target: #N` を1行で記録する。plan/stop/resumeの3 runとartifactを人が確認後、実行器と費用計測を選定してから、別PRで最小のDraft PR作成経路を設計する。

