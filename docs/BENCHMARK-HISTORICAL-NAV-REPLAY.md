# 固定ナビ：旧mainを隔離した歴史的な入力遮蔽の診断

評価ID `shinso-nav-click-01`。旧CI [#38197626223](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38197626223) の`tests/quieter-loop.cjs`では、390×680で観測の「自動巡回」育成ボタンが、固定nav内の`#game-menu`に遮られ、その後DOMが差し替わりPlaywrightがタイムアウトした。

## 検証方法

- **旧コード**：失敗した当時のコミット `2769ec27710f4efecf3e49aea9ff5738e298a4ca` を独立サブディレクトリへ読み取り専用checkout。
- **現行コード**：検証中のPR headを別のサーバーから配信。旧コードへ修正を持ち込まない。
- 同じChromium 390×680、100→5000ptのゲーム状態、観測移動→20件で自動巡回解放→実Playwrightクリックを使用。旧側は**3回の独立ブラウザページ**で診断する。修正済み側は通常クリック後に実際の育成Lvが増えることを必須とする。
- `artifacts/benchmark-nav-historical/` に各画像と、結果を機械判別できるJSONを保存。秘密・ユーザーデータ・生ログは含めない。

## 判定の重要な違い

- 旧コードで `nav ... intercepts pointer events` を実観測した時だけ `negative_replay_status=confirmed_in_one_or_more_historical_trials`、`replay_baseline_ready=true` とする。
- 旧コードでも3回とも成功した場合は `negative_replay_status=inconclusive_not_reproduced`、`replay_baseline_ready=false`。**診断のGitHub Actions自体がsuccessでも、歴史的バグが再現できたという意味ではない**。
- 旧コードで無関係な例外/クリック失敗、現行コードで育成が進まなければ必ずCI failure。旧テスト/本番テストを削除・skipしない。AIの独立18試行とは混同しない。
- 実iPhone Safari・Firestore同期と当時のCI runner/Chrome build完全再現は別途検証が必要。ブラウザバージョンやGPU状態の差が再現性に影響しうる。

## これまでの実測

- [Run #38420136977](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38420136977)、[#38420549878](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38420549878)、[#38420607839](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38420607839)では、旧コード・現行コードどちらもクリック成功。過去の遮蔽は再現できていない。
- 以上から旧CI実ログに失敗の証拠があっても、「現在の分離再現環境で歴史的負例が再現した」とは認定しない。

この診断は修正品質・AIの優劣を自動採用するゲートではない。
