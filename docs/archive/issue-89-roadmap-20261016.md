# Issue #89 — historical roadmap archive

This is a point-in-time archive of the former Issue body. Current status belongs to live GitHub Issues, PRs and Actions; do not treat historical checkboxes as current.

Source: https://github.com/b-w-hiroki/shinso-gacha/issues/89

---

## 現在の作業入口（GitHub運用Pilot / 2026-10-16）

**この節が最新の実行キュー入口です。** 以下より下は過去の経緯・参照ログであり、新規作業や決定事項を本文末尾に追記し続けない。GitHub/PR/CIの最新状態を毎回取り直す。

- 判断待ち：[Decision #173 — Projects所有先・公開範囲](https://github.com/b-w-hiroki/shinso-gacha/issues/173)。この決定でゲームの通常開発はブロックしない
- 次の優先実装：[Task #174 — 車載・教室の新規画像とR/SR/SSRを本番へ統合](https://github.com/b-w-hiroki/shinso-gacha/issues/174)
- 次の素材：[Task #175 — 人物画像・シルエット](https://github.com/b-w-hiroki/shinso-gacha/issues/175)
- ストーリー：[Task #176 — 未来報告・課員証言の多段階分岐](https://github.com/b-w-hiroki/shinso-gacha/issues/176)
- 棚卸：[Task #177 — 50案の実装済み/未実装/判断待ち仕分け](https://github.com/b-w-hiroki/shinso-gacha/issues/177)
- 保留：[Task #178 — GitHub Projects v2の実ボード接続](https://github.com/b-w-hiroki/shinso-gacha/issues/178)（Blocked by Decision #173）
- 既存障害：[Issue #141](https://github.com/b-w-hiroki/shinso-gacha/issues/141) は長期再発監視。人手・権限待ち：[Issue #75](https://github.com/b-w-hiroki/shinso-gacha/issues/75)。人物/物語Epic：[Issue #82](https://github.com/b-w-hiroki/shinso-gacha/issues/82)

共通正本：Private [studio-playbook/GITHUB-OPERATING-MODEL.md](https://github.com/b-w-hiroki/studio-playbook/blob/main/docs/GITHUB-OPERATING-MODEL.md)（`phase=pilot`）。本作品の入口：[`docs/GITHUB-WORKFLOW-PILOT.md`](https://github.com/b-w-hiroki/shinso-gacha/blob/main/docs/GITHUB-WORKFLOW-PILOT.md)（Pilot PRがmainへ反映されるまで新リンクは未公開）。

---

## 進捗（最新）
- [x] PR #90: 取得済み調査に未来の報告と未登録立会人の基本表示を追加（Smoke/Chromium/WebKit/Firestore成功、mainマージ）
- [ ] #82残件: 専用人物図鑑、人物素材、日付連動、受信箱接続

## 目的とDone条件
「不完全に生成された現実」を土台に、観測・資料・人物・都市伝説・調査室・報告が一つの周回ループになるまで開発。発見済み件数のみ表示し、全数/達成率/未取得人物情報を秘匿。既存セーブ/報酬/低刺激設定を保持し、毎PRでSmoke・Chromium・WebKit・Firestoreエミュレーター・スマホQAを確認する。GitHub PR→mainマージ→Pages公開を追跡。

## 残タスク（対応するIssue）
- [x] #78 図鑑の収集総数を非表示、現在数維持
- [x] #79 5種の怪異、受信箱と調査案件の接続
- [x] #80 レイアウト修正/12映像条件/導線の初期整理
- [x] #84 再鑑定、合同調査、報告書の基盤
- [x] #85 観測を離れた時間、育成表記
- [x] #86-#87 異常な記録文言と観測への繊細な干渉
- [x] #88 不在時の痕跡、観測復帰の意味づけ
- [x] #81 **本物の観測地を複数追加**：背景の平常/異変差分、素材分割、座標、抽選/ローテーション、長時間QA
- [ ] #82 **未来の報告/未確認課員/予告異変**：取得/閲覧での解放、個人情報不使用、未取得の情報をDOMに出さない、受信箱・人物図鑑へ連結
- [x] #83 **収集分類の拡張**：秘密分類、原本と重複の比較、欠落ページ、再鑑定、変更可能な仮説報告、既存の原本不変
- [ ] **50案第一群：観測と現実の矛盾**：世界の継ぎ目、季節違い、再生成、別地点の一致、観測しないと気づけない証拠
- [ ] **50案第二群：観測者への逆干渉**：操作先読み/行動模倣/撮影者/先に届く返信/他の閲覧者。すべて架空のゲーム内表現
- [ ] **50案第三群：収集の深化**：人物差分、原本候補、欠落ページ、写真裏面、証言履歴、未発見秘匿/再鑑定と関連付け
- [ ] **50案第四群：第六文書課の秘密**：虚偽証拠、真相再解釈、存在しない上司、調査室の構造矛盾、世界の修正履歴
- [ ] **演出品質**：怪異発生率、クールダウン、離席強制しない、低刺激/OS reduced-motion、文字とタップ領域、390x844/320x568 QA
- [ ] #75 **外部手動の本番QA**：Firebaseルール公開の照合、テストアカウントの端末間同期/削除・復活防止、iPhone Safari実機

## 運用
最新main、open PR、CIを毎回先に確認。既存の実装・Issueと重複しない。1つの大PRではなく段階的に実装→CI→QA→マージ。**未実装を実装済みと報告しない**。本番Firebase/実機は外部の認証・端末が必要である限り未完了扱いにする。

## 2026-10-11 進捗
- [x] PR #90：入手した調査案件に未来の報告書と未登録立会人の痕跡を接続（#82の一部、全体は未完了）
- [x] PR #91：証言の矛盾を記録した案件だけに「機密」分類を解放し、図鑑から調査へ導線を接続（#83の一部、全体は未完了）
- [ ] 次：機密人物の専用図鑑、真の観測ロケーション追加、資料比較と調査報告拡張

- [x] PR #92：証言矛盾の照合済み事件に限り『登録のない立会人』が人物図鑑へ出現し、対応する未来報告・調査案件へ遷移。未解放はDOM非表示。#82は残作業があるため未完了。

- [x] PR #93：通常観測で新規背景4地点（地下通路、夜の教室、踏切前、海沿い夜道）へ切り替える第一弾。異変画像・接触座標・セーブは維持。#81の一部、Issue全体は未完了。

- [x] PR #101：新観測地4枚の仮SVGを写真調WebPへ置換し、固定画面にフィット。画像4枚GitHub push・全PR CI成功・mainマージ。高解像度化と文字焼き込み是正・各地点の異変差分は#81残タスク。

- [x] PR #103：追加4地点の実観測だけを `locationRecords` に保存、図鑑「場所」で発見済み地点を個別表示（日時・訪問回数・画像）。未発見/総種類数は秘匿。PR全CI成功・mainマージ・Pages成功。Issue #81の一部。
- [ ] 観測用4画像のネイティブ高解像度・文字なしの本番アートへ差し替え、異変差分/専用タップ座標は未完了。新たな写真調候補は作業ファイルとしてのみ準備（GitHub未反映）。


## 2026-10-14 最新mainと今回の完了分（古い進捗記述より優先）

- 基準main：`2dff86472ce73002f16034d3457276675ac4de9c`。open PR 0。
- [x] PR #148：https://github.com/b-w-hiroki/shinso-gacha/pull/148 — WebKit写真/車載SSRの独立反復QA追加。main `140dac7` Smoke/Chromium/WebKit4媒体/Firestore 全8ジョブとPages成功。
- [x] PR #149：https://github.com/b-w-hiroki/shinso-gacha/pull/149 — 立会人の取得済み原本と、3人の課内証言を実際に確定した人事ファイルの双方向照合を追加。保存/報酬・秘匿条件不変。PR CI `38565214464`、main CI `38566018239`（8ジョブすべて成功）、Pages `38566019529` 成功。#82は一部対応。
- [x] PR #150：https://github.com/b-w-hiroki/shinso-gacha/pull/150 — 都市伝説u1〜u12に固有の「現実の継ぎ目」の証言文を追加。PR #149とのドキュメント競合は双方維持で統合。PR CI `38566271937` 全8ジョブ成功、mainマージ済み。マージ後 CI `38567048002` とPages `38567047764` はこの追記時点で検証中。
- [ ] P0 #141：初回成功率とWebKit暗部補正操作の間欠的不安定性。成功した反復QAだけでは長期安定化の証拠不足。実機Safari #75も必要。
- [ ] P0 #75（human-required）：本番Firebaseルール反映、テストGoogleアカウントの物理2端末同期・削除復活拒否、iPhone Safariの縦横/低刺激/8地点の実機操作。管理認証・端末がない限り未実施とする。
- [ ] P1 #82：人物・事件の個別最終アート、会話/未来報告/受信箱のさらなる多段階連動、取得順の長時間プレイ検証。
- [ ] P1 観測素材：4追加地点×R/SR/SSRの最終同一視点写真表現、暗部と差分発見の人間評価、音・恐怖の質と低刺激の両立。
- [ ] P2 残りの50案：逆干渉/資料比較/第六文書課の謎のさらなる個別ケース実装。12件の固有矛盾は第一群の部分対応のみ。
- [ ] P2 UI/UXとゲームバランス：320/390幅の実機画面、5/30/60分・翌日復帰テスト、異変頻度・育成・地点偏り・重複テキストを実測して調整。
- **重要**：PR/CIの成功はプレイヤーの恐怖、長期継続性、本番の権限反映を保証しない。残件はOPEN維持。次回チャットは `docs/AI-RESUME.md` と最新mainを読み直す。


### 2026-10-14 マージ後の最終CI／公開確認
- 最新main `2dff86472ce73002f16034d3457276675ac4de9c`：Smoke/Chromium/WebKit×4媒体/Firestoreの計8ジョブすべて **success**（https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38567048002）。
- Pages本番公開経路は **success**（https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38567047764）。
- Open PR 0。PR #149/#150 の使い捨てリモートブランチが残っていないことを確認。
- **未完了条件は変更なし**：#141 WebKit不安定性の継続的再現/実機評価、#75 本番Firebase/iPhone、#82 個別素材/物語、残り50案/継続プレイ体験検収を引き続き追跡。


## 2026-10-14 継続実装：観測・事件の相互照合と未取得枠の秘匿

- 現在のmain: `79c7dfc3e37119f7a9c79d33761b5afcfa4a9a14`。Open PR 0。
- [x] [PR #151](https://github.com/b-w-hiroki/shinso-gacha/pull/151)：追加4地点への実訪問・都市伝説の3断片・差異の明示記録が揃った場合のみ、12件固有の事件と地点原本を相互照合。該当地点で実際にR/SR/SSRを回収した時だけ追記。未取得名称/画像を秘匿、セーブ・抽選/ptを変更せず。PR CI [#38584092318](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38584092318) 全8ジョブ初回成功、390x844取得済み照合画面を画像目視、main CI [#38585043275](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38585043275) 8ジョブsuccess、Pages [#38585043737](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38585043737) success。
- [x] [PR #152](https://github.com/b-w-hiroki/shinso-gacha/pull/152)：旧4媒体・追加4地点の場所図鑑詳細で未取得区分の「未観測」ボタンをDOM非表示にし、取得済み原本だけ描画。既存保存と経済/レアリティは不変。PR CI [#38585493202](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38585493202) 全8ジョブ初回成功。390x844の取得済み照合欄を画像で確認。mainへマージ済み。
- [ ] PR #152マージ後のmain CI [#38586509994](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38586509994) とPages [#38586505659](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38586505659) は本追記時点で進行中。**結果未確定**。

### 引き続き未完了（完了扱い禁止）
- P0 [#141](https://github.com/b-w-hiroki/shinso-gacha/issues/141)：WebKit暗部補正の間欠的不安定性は単一run成功で解消確定しない。発生時のログ・頻度追跡と実iPhone検証が必要。
- P0 [#75](https://github.com/b-w-hiroki/shinso-gacha/issues/75)：本番Firebase権限・物理2端末の同期/削除、iPhone Safari縦横の実操作は`human-required`。認証・実機なしに実施済みとはしない。
- P1 [#82](https://github.com/b-w-hiroki/shinso-gacha/issues/82)：専用人物・観測異変素材の最終写実品質、未来報告と受信箱/会話の多段階接続、プレイヤーの発見時間/恐怖検証。
- P1/P2：残りの50案（逆干渉・収集の深化・第六文書課の内部矛盾）、4地点×R/SR/SSRの最終素材、長時間/翌日復帰/育成経済・320px/実機UIUX評価。
- **全体Done未達**。今回の2件を全残件の完了とみなさない。


## 2026-10-15 観測・秘匿の修正記録（最新main優先）
- [x] PR #153 https://github.com/b-w-hiroki/shinso-gacha/pull/153：都市伝説調査一覧から未取得事件のdisabled枠とDOM内IDを除外。未取得0件→1件→複数件のChromium/WebKit回帰を追加。PR CI https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38587020651 8/8 success。main CI https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38587821514 8/8 success、Pages https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38587821905 success。
- [x] PR #154 https://github.com/b-w-hiroki/shinso-gacha/pull/154：WebKitで不安定要因となり得る1440pxの3層合成写真への追加CSS GPUフィルターを除外。通常/R/SR/SSRと実タップのテストを維持。PR CI https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38588216807 は8/8 success。前後390×844スクリーンショットを比較し、構図・UIの崩れは見られなかった。main SHA `79e683b3155b0e97a2c309fe10ebb133714f079e` へマージ済み、Pages https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38589161748 はsuccess。main Smokeは報告作成時に実行中。
- [ ] #141：一度の成功でクラッシュ根絶とは扱わない。日次監視PR #156 https://github.com/b-w-hiroki/shinso-gacha/pull/156 を別途進行中。失敗頻度とiPhone Safari実機が未完了。
- [ ] #75（human-required）：本番Firebase配備確認・2物理端末同期とアカウント削除・iPhone Safari・人間のプレイ体験は未実施。
- [ ] #82 / #89：人物・異変素材の最終アート、反復プレイ計測、残りの物語・収集拡張は継続。人間評価なしで「全完了」としない。


### 2026-10-15 PR #156日次WebKit安定性監視
- PR #156 https://github.com/b-w-hiroki/shinso-gacha/pull/156 をmain `7348aba27a960b01150b83c6725b2f434bc6cd0d` にマージ。
- 既知クラッシュ対象の写真・車載SSRを日次・手動・専用PRで繰り返す専用Actionsを整備（`.github/workflows/webkit-ssr-stability.yml`）。それぞれ別ランナー、新規ブラウザプロセスで低照度・実クリック3回＋写真状態7回（SSR4回）。最初の失敗を残し、artifactにSHA/媒体/回数を30日保存。
- 初回専用PR run https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38589720892 は2ジョブとも初回成功。車載の実artifactログを読み、低照度3/3・通常/R/SR/SSR計7/7を確認。PRの通常CI https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38589720335 は8/8成功。
- mainのPages https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38590669748 は成功。main全回帰 https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38590669508 はこの記録時点で継続中（7/8成功）。
- WebKitの長期再発率は日次runが蓄積してから評価。iPhone Safari・本番Firebaseは#75、未完のアート/物語/人間のプレイ評価は#82/#89のままOPEN。


### 2026-10-15 #156 main公開後最終確認
- main `7348aba27a960b01150b83c6725b2f434bc6cd0d`：Smoke/Chromium/一般WebKit/写真4方式WebKit/Firestoreの全8ジョブ **success**：https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38590669508
- Pages公開 **success**：https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38590669748
- PR #156はmerged、使い捨てブランチの遠隔削除成功。日次監視の初回photo/dash 2/2 success、artifact確認済み。
- 残件：iPhone Safari実機と本番Firebase #75、人間の発見性・長時間プレイ・素材最終品質 #82/#89、間欠的不具合の長期再発率 #141。すべて未完了として継続追跡。


## 2026-10-15 追加統合：受信箱と未来報告の取得条件
- [x] [PR #155](https://github.com/b-w-hiroki/shinso-gacha/pull/155)：取得・確定した人事原本へ受信箱から遷移。未確定の人事ファイルはメールだけでは開かない。PR CI [#38589344043](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38589344043) 全8ジョブ成功、main `3a9bc8f` マージ、main CI [#38590170002](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38590170002) 全8成功、Pages [#38590168487](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38590168487) success。
- [x] [PR #156](https://github.com/b-w-hiroki/shinso-gacha/pull/156)：WebKit写真/車載SSRを日次・手動・PRで独立反復監視。初回日次2ジョブとPR CI全8ジョブ成功。main `7348aba` マージ、main CI [#38590669508](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38590669508) 8/8成功、Pages [#38590669748](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38590669748) success。
- [x] [PR #157](https://github.com/b-w-hiroki/shinso-gacha/pull/157)：未来報告メールは事件3断片を保持し、同じ観測方式の後日実回収による照合済み条件を満たす場合だけ新規配信。旧メールだけで未取得調査へリンクしない。main更新と競合しない3ファイルを保全してマージ。PR CI [#38590915131](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38590915131) 8/8、main `646f08e695e080aaf9e56dd9bbbfd66915db3501` のCI [#38591620678](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38591620678) 8/8 success。Pages [#38591619888](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38591619888) は記録時点でデプロイ実行中。
- [ ] **継続必須**：#141 間欠的WebKitクラッシュの日次実測・iPhone Safari、#75 本番Firebaseルール/実アカウント物理2端末、#82 人物固有の最終素材と分岐、残りの50案、4地点×R/SR/SSRのアート/発見性、5・30・60分・翌日復帰の人間プレイQA。
- CI成功・ワークフロー導入は長期安定性やゲーム性の検収ではない。人間/管理者が必要なタスクはOPENで追跡する。次回は `docs/AI-RESUME.md` とGitHub live mainを正にする。


## 2026-10-15：12件の未来報告と未取得秘匿の強化
- [x] [PR #158](https://github.com/b-w-hiroki/shinso-gacha/pull/158)：都市伝説u1〜u12の翌日予告、原本との差異、立会人の後続証言を各事件固有の内容へ変更。未設定断片数がNaNになる既存判定を修正し、3断片未取得なら未来報告を返さない。PR CI [#38596655386](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38596655386) 8/8 success、main `487f1b2` へマージ。main CI [#38597534009](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38597534009) 8/8、Pages [#38597529640](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38597529640) success。
- [x] [PR #159](https://github.com/b-w-hiroki/shinso-gacha/pull/159)：未来報告・現実の継ぎ目・保管異常の3モデルで未設定/NaN/Infinityを厳格に拒否し、証拠フラグを真偽型で判定。未知IDや未正規化の保存書込みも拒否。PRの途中コミットではInfinity境界試験が不成立となったが、修正後の最終head `063f80b` のCI [#38597881478](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38597881478) は全8ジョブsuccess。main `d587ea0` にマージ。マージ後CI/Pagesは検証中。
- **残**：人物の最終画像品質、より深い証言と将来報告の接続、長時間取得順テスト、実機Safari・本番Firebase（#75）。新しい文面の恐怖と発見しやすさは実プレイ未検証。


### 2026-10-15 最新main配信の確定結果
- main `d587ea0d143aa99c6efa1bb4d280af0195088439` にPR #158/#159の両変更を統合。
- main Smoke/Chromium/WebKit4媒体/Firestoreの8ジョブすべてsuccess：[Actions #38599038027](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38599038027)。
- GitHub Pagesのbuild/deployもsuccess：[Actions #38599036099](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38599036099)。
- Open PR 0、両PRの使い捨てリモートブランチ削除確認済み。
- **未完了項目**：#141 間欠不安定性の長期再発確認、#75 実機iPhoneと本番Firebase、#82 最終人物・異変素材/更なる会話接続、#89 残りの50案・発見性・継続プレイ体験実測。本番実機と人間による検収は未実施であり、CI全成功だけで全件Doneとしない。


## 2026-10-15 固定実行キュー（優先順位を変更しない）
この10件を現行の固定実行キューとする。途中で新しいアイデアが出ても原則ここへ混ぜず、別候補として記録する。完了には実装・テスト・CI・mainマージ・Pagesの証拠を必要とする。人間による評価、本番認証、物理端末は検証なしにDoneとしない。

- [ ] 1. P0 WebKit SSR/暗部補正の間欠クラッシュの再発率・原因と修正（#141）
- [ ] 2. P0 本番Firebaseの権限・同期・競合保存・削除（#75、human-required）
- [ ] 3. P0 iPhone Safari縦横・観測・低刺激・実タップ（#75、human-required）
- [ ] 4. P1 追加4地点×R/SR/SSRの12異変素材を最終制作・検収
- [ ] 5. P1 人物専用画像・シルエット・資料表現の品質統一（#82）
- [ ] 6. P1 第六文書課・未来報告・予告異変・課員証言の多段階シナリオ（#82/#89）
- [ ] 7. P1 50案ロードマップの未実装要素の棚卸し・追加（#89）
- [ ] 8. P2 異変頻度・地点偏り・育成とレアリティ配分の実測調整
- [ ] 9. P2 320/390pxと横画面の視認性・操作性の仕上げ
- [ ] 10. P2 5/30/60分・翌日復帰の継続プレイ評価（human-required）

実装順は 1→4→5→6→7→8→9→10、2・3は並行で進める。新規のスコープ追加で完了条件を無期限に広げない。


### 2026-10-15 固定タスク4：16映像の目視一次監査

- 通常＋R/SR/SSRの4方式×4状態を390pxのQAコンタクト画像で確認（素材の比較に限る。人間による発見時間の測定ではない）。
- 車載 `dash-coast-road-native.webp` は道路を斜め上から見下ろす構図で、UIの「車載カメラ」と映像視点が食い違う可能性がある。新マスターを制作する場合は車内前方から同一地点を撮った構図を基準とし、差分3点とホットスポットも同一の投影で再生成する。
- 写真 `photo-classroom-native.webp` のR/SR/SSRでは上部に赤い帯・人型など画面レイヤー由来の演出が見え、室内照明と素材の馴染みを再検収する。通常との差分発見可能性と「最初から正解がわかる」過剰演出は分けて判断する。
- CCTV/視界ジャックを含む12差分はピクセルの存在・SHA・接触座標がCIで通っても、本番向けの同一視点写実品質は未認定。#141のSSR描画安定化に必要な合成画像を原本の更新と混同しない。
- Done条件：各媒体の視点・地形・照明・異変位置を画面で確認→新原本/差分/ホットスポット整合→320/390/844横の実タップQA→ブラインド評価→PR/main CI/Pages。素材品質は **未完了**。
