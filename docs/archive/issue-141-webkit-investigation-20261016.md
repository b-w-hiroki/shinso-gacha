# WebKit issue #141 historical investigation

Archived body; current status is the live Issue, PRs and Actions.

---


## 2026-10-15 WebKit描画負荷軽減・再発計測

- PR #154 https://github.com/b-w-hiroki/shinso-gacha/pull/154 — 4方式のネイティブ写真＋透過WebP＋SVGの前景合成面からCSS `saturate/contrast` を除去。画像、保存、タップ座標は維持。PRのSmoke/Chromium/WebKit/Firestore **8/8成功**（https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38588216807）、390×844写真/車載SSRの前後スクリーンショットを目視比較し、大きなレイアウト/構図崩れなし。main `79e683b3155b0e97a2c309fe10ebb133714f079e` に反映しPages成功。
- PR #156 https://github.com/b-w-hiroki/shinso-gacha/pull/156 — WebKit写真/車載の**日次・手動・PR**独立反復QAを導入。各方式：本物の低照度/ズームクリック3回、通常/R/SR/SSR + SSR追加3回。1試行失敗でrun失敗、再試行で成功と偽装しない。対象SHA・実行ID・各試行ログをartifactに30日保存。
- 初回のPR日次監視実行 https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38589720892 は photo/dash **2/2ジョブ成功**。車載ログには低照度3/3、写真状態7/7（SSR4回含む）を記録。PRの通常CI https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38589720335 も8/8成功。main `7348aba27a960b01150b83c6725b2f434bc6cd0d` へマージ済み。main CI/Pagesは記録時に実行中。
- **IssueはOPEN**：長期の初回成功率は日次runが累積してから評価。物理iPhone Safariと本番Firebaseは #75。改善の予防的実装と再発根絶の確認を混同しない。

---

## 現行状況（2026-10-14）

- PR #140 は main マージ済み。旧本文の「未マージ」は 2026-10-13 の発生時点の記録。
- PR #148 は SSR 写真・車載映像を独立プロセスで追加反復するCI強化として main にマージ済み。
- main `140dac7c537b4b99386cbef7924e93591bfe78b1` の8ジョブは全成功：https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38564124951 。Pagesも成功：https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38564125821 。
- **残件**：以前発生したWebKit暗部補正操作の間欠的不安定性について初回成功率を継続確認し、必要時はGPU合成や実タップ判定を再分析する。物理iPhone Safari と本番Firebaseは #75 に分離。
- 反復テストの成功のみで長期の不安定性解消とは宣言しない。テスト削除・skip禁止を維持。

---

## 再現（2026-10-13）
main `123b52784ab475f5677714240c826388735561bb` でWebKitの観測画像QAが失敗。PR #140で4方式ごとの独立ランナーと、平常/R/SR/SSRの各状態ごとの独立WebKitブラウザプロセスを追加し、GPUフィルターを減らしても完全解消していない。

- CI: https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38334221490
- WebKit一般UI QA / Smoke / Firestore: 成功
- 写真媒体（夜の教室）: 平常/R/SRは成功、SSR（rarity 3）で `page.evaluate: Target page, context or browser has been closed`。
- 車載媒体（海沿い夜道）: 平常/R/SRは成功、SSR（rarity 3）で同じWebKitクラッシュ。
- 監視カメラ（地下通路）と視界ジャック（踏切前）は4状態とも成功。
- Chromium全体は最新run完了後に確認。

## 対応方針・Done条件
1. Playwright WebKitのSSR状態に絞り、レンダラ終了とWebP/SVG多重背景・CSSコンポジットの関係を再現/計測する。
2. 複数の背景画像重ね合わせを、必要なら本番品質を保ちながら別要素・事前合成等に置換。保存ID、接触領域、確率、pt、4地点×R/SR/SSR素材を保持。
3. WebKit全4方式×平常/R/SR/SSRの実画像・実タップ・保存をすべて成功させる。テストを削除・スキップしない。
4. Chromium/Smoke/Firestore/CSP/390×844スクショの回帰を全件確認。
5. PR #140は**CI失敗中で未マージ**。全ジョブ成功後のみマージ・mainのActionsとPagesを確認。
6. 本番iPhone SafariはIssue #75として別途実機確認する。

関連: #89、PR #140。

### 2026-10-15 #156 main公開後最終確認
- main `7348aba27a960b01150b83c6725b2f434bc6cd0d`：Smoke/Chromium/一般WebKit/写真4方式WebKit/Firestoreの全8ジョブ **success**：https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38590669508
- Pages公開 **success**：https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38590669748
- PR #156はmerged、使い捨てブランチの遠隔削除成功。日次監視の初回photo/dash 2/2 success、artifact確認済み。
- 残件：iPhone Safari実機と本番Firebase #75、人間の発見性・長時間プレイ・素材最終品質 #82/#89、間欠的不具合の長期再発率 #141。すべて未完了として継続追跡。


### 2026-10-15 / PR #161: first-attempt WebKit SSR failure evidence

- Old main `952ac475f91c3b1af2984df3c8e21f94f4d9b48e`. First dedicated replay [run #38650938967](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38650938967) failed **without retries**: photo 9/10 (SSR repeat #6 page closed), dash 7/10 (SSR repeats #5 and #6 page closed, #7 timed out). Capture `results.json` and per-trial logs in `webkit-stability-photo` / `webkit-stability-dash` artifacts.
- Interim SSR gradient candidate `39be1027`, [run #38651445670](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38651445670), also failed: dash 8/10 (SSR #4 and #6 `page.evaluate: Target page, context or browser has been closed`; #5/#7 passed). Background de-duplication by itself has **not** established a fix. Keep failure record, do not mark #141 resolved.
- PR [#161](https://github.com/b-w-hiroki/shinso-gacha/pull/161) integrates all 10 first-attempt results per mode and replaces SSR-only fourth blurred 1440px background texture with a gradient while retaining actual photo/WebP/SVG evidence and tap geometry. Final head `23c69fa24528218cb212421cf3e03634f9ff2319`: [full PR CI #38651626784](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38651626784), [independent SSR QA #38651626778](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38651626778); both pending completion at this update. **Merge only if both pass without skipping or retrying failed trials**.
- Root cause remains unproven (WebKit compositor, photo layer resource use, or runner behavior). Actual physical iPhone Safari still requires #75. Do not count a single passing CI run as proof of long-term stability.


### 2026-10-15 PR #162後のmain回帰とSSR事前合成案

- main `85639f9b2cd07ede89dd3331a7cb50499993d9c4`（PR #161/#162を含む）はPages公開成功 [#38657027573](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38657027573) だが、**main全8ジョブ中photo/dashのWebKit画像QAが失敗** [#38657027909](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38657027909)。両者ともSSR追加反復で WebKitの `Target page, context or browser has been closed`。写真は `after-native-photo-fetch:photo:3`、車載も `after-native-photo-fetch:dash:3` の直後。Pagesが成功してもWebKit回帰を見逃さない。
- PR #162までのSSR背景フィルター/3レイヤーCSS長手指定/非インタラクティブ画像分離では解決していない。初回成功と反復の成否を分ける。
- [PR #163](https://github.com/b-w-hiroki/shinso-gacha/pull/163) は原本・透過WebP異変・SVG手がかりを事前に合成した**1440×720 WebP4枚をリポジトリへpush**し、SSRのGPU画像合成をブラウザ側からビルド時へ移す。原本12点のSHA、出力画像4点のSHA、合成スクリプト、監査テストを用意。画像の位置、タップ範囲、pt、抽選、保存には変更なし。
- PR #163の先行CI [#38658490244](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38658490244) ではブラウザテストのNode側モデル参照が未importで `ReferenceError: WatchLocations is not defined` となったため、試験を削除せず `246a307` で修正。**最終head `246a307...` の [Smoke CI #38658695537](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38658695537) と [SSR専用 #38658695582](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38658695582) は結果確認前。必ず同SHAの全ジョブで判断。**
- 長期再発率と実iPhone Safariは未検証のため、本IssueはOPENのまま。前段の失敗runを再試行して成功扱いにしない。


## 2026-10-15 SSR事前合成の追跡（PR #163）
- PR [#161](https://github.com/b-w-hiroki/shinso-gacha/pull/161) と [#162](https://github.com/b-w-hiroki/shinso-gacha/pull/162) はmain反映済みだが、WebKit SSRの反復QAで写真/車載のプロセス終了が継続した。CSSぼかし・影の軽量化とDOM img分離だけでは再発根絶を確認できない。
- PR [#163](https://github.com/b-w-hiroki/shinso-gacha/pull/163) はSSRの原本+写真差分+手掛かりを**ビルド時に一枚へ合成**し、実ゲームは1つのWebP背景だけをデコードする構成。元のCC0写真・透過WebP・SVGはすべて残し、同一1440×720/2:1座標を保持。
- 派生4バイナリ `assets/observation/ssr-composites/` をGitHub featureブランチへpush済み。由来/入力/出力 SHA-256 は `docs/qa-incursions/ssr-composite-build.json` で管理。再生成は `scripts/build-ssr-composites.py`。元素材と派生ファイルの整合性を `tests/ssr-composite-asset-audit.cjs` で検証。
- 初回PR #163 CIでは独立モデルテストを通過した一方、WebKit/ChromiumでNode側の `WatchLocations` import漏れを検出。実クリックや画像検証を削除せず修正し、並行作業で発生した重複importも除去。最終head `486d2700d31647a09c82b072b0fb6e3e08fe486c`。
- **未完了**：最終head の通常CI 8ジョブ [#38658837520](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38658837520)、写真・車載SSR専用 [#38658837428](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38658837428) と390x844表示の検証。成功するまではmainマージ禁止、長期初回成功率・物理iPhone Safariは別件としてOPEN維持。


### 2026-10-15 #163 precomposed single-image SSR stability result

- PR [#163](https://github.com/b-w-hiroki/shinso-gacha/pull/163) includes four 1440×720 single-texture SSR WebP assets, build script, SHA-based source integrity audit and real-coordinate hit tests. This eliminates runtime three-image SSR compositing but **is not a confirmed fix**.
- SHA `486d2700d31647a09c82b072b0fb6e3e08fe486c`, [dedicated replay #38658837428](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38658837428): photo **7/10 PASS, 3/10 FAIL**; repeated SSR #5-#7 crash (all real WebKit page termination). First SSR passed; subsequent attempts failed in the same runner despite fresh child processes. Failed `webkit-stability-photo` artifact holds individual raw logs and `results.json`. Never count retry as first-attempt success.
- [Standard CI #38658837520](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38658837520) also has photo/dash WebKit image QA failures on the same head, while Smoke/Firestore/Chromium/normal WebKit are largely successful. This is **not** simply an assertion failure.
- Investigate whether GitHub Ubuntu WebKit process accumulation, resource pressure, font/image decode, or compositor state is exhausting the runner. Record memory/process snapshots before and after independent trials to disambiguate. Require a clean first-attempt matrix and visual QA before merge. Retain #141 OPEN, #75 physical Safari QA required.
