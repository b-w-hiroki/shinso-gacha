# 固定ナビの歴史的な入力遮蔽を独立検証する

評価ID `shinso-nav-click-01`。過去の失敗run [38197626223](https://github.com/b-w-hiroki/shinso-gacha/actions/runs/38197626223) では、390×680で観測「自動巡回」育成ボタンの実クリック時に、固定nav内の `#game-menu` がpointer eventsを遮ってPlaywrightがTimeoutした。

- **歴史的コード**：コミット `2769ec27710f4efecf3e49aea9ff5738e298a4ca` をActionsで別サブディレクトリへread-only checkout。
- **現行コード**：mainに相当する当該PR checkout。実ゲーム状態・380ではなく**390×680**のviewport、20件の観測、5000pt、自動巡回育成ボタンの同一Playwright実クリックを使用。
- **判定**：歴史的コードで `nav intercepts pointer events` 系エラーを確認し、現行コードでは普通の実クリックでLvが増えることを要求。両状態のスクリーンショットと、低機密の判定JSONのみ保存する。例外一般を「昔の不具合再現」に転用して緑にしない。
- **操作**：`node tests/benchmark-historical-nav-replay.cjs`。Actionsでは `historical/` の旧コードを同時に置く必要がある。
- テストのために他の作品や本番ユーザー状態を変更しない。履歴をmainへ巻き戻さない。ログ全文を成果物へ保存しない。
- 旧不具合再現が成功しても、それだけで独立AIモデルの18試行・人間体験品質・物理iPhone/WebKitは完了しない。
