# WebKit日次検証の完了率

日次workflowは24ジョブで60試行を予定する。集計は同じSHA・run ID・run attemptのartifactにある各試行だけを採用し、成功、失敗、未完了を別々に表示する。10回連続試行4組と単独試行20件は実行条件が異なる。60件を独立した日次run数に換算しない。

`coverage-summary` は前段が失敗した場合にも集計する。artifactがない、途中までしか記録がない、重複・不正形式・異なるrunの記録がある場合は未完了とする。失敗と未完了が混在した場合も両方の件数を残す。実際の失敗が1件でもあれば失敗、未完了だけでも集計ジョブは成功にしない。

workflow自体の手動キャンセルやサービス停止では集計ジョブも実行されない場合がある。その場合はActionsのrun状態とジョブ一覧を直接確認し、集計artifactなしを成功と扱わない。途中ジョブだけの再実行では旧attemptのartifactを混ぜず、必要ならworkflow全体を再実行する。過去runの最初の失敗を消したり、「再発なし」の根拠に使ったりしない。

ローカル確認:

- `node tests/webkit-stability-summary.mjs`
- `node scripts/webkit-stability-summary.mjs <展開先> <SHA> <run ID> <attempt>`

## 今回の変更範囲

診断集計のみ。ゲームコード、保存、素材、CURRENT-SPECの製品仕様、EXPERIENCE-DESIGNの体験設計は変更しない。キャンセル理由・10月31日のブラウザ失敗の根本原因、実機品質はこの集計だけでは確定しない。異変の発見性は別途、答えを知らない人による観察を必要とする。
