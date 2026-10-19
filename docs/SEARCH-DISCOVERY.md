# 検索公開範囲と測定手順

## 公開範囲

- canonical は `https://shinso-gacha.birdman-studio.com/` の1件とする。
- sitemap はゲーム入口だけを掲載する。観察番号を含む共有 URL `?ref=` は sitemap に入れず、全 URL がルートを canonical として示す。共有リンクのプレビューと canonical の読取を妨げないよう `robots.txt` では遮断しない。
- `robots.txt` はアクセス制御ではない。観察番号から個人情報や保存データを取得できる実装にはしない。
- ゲーム進行、保存データ、アカウント画面は HTML に公開内容として埋め込まず、検索用メタ情報には現行仕様の概要だけを書く。

## 比較可能な測定

UTC 日時と実行環境を記録し、公開後に次を実行する。

```sh
curl -sS -D headers.txt -o index.html https://shinso-gacha.birdman-studio.com/
curl -sS -D robots-headers.txt -o robots.txt https://shinso-gacha.birdman-studio.com/robots.txt
curl -sS -D sitemap-headers.txt -o sitemap.xml https://shinso-gacha.birdman-studio.com/sitemap.xml
node tests/search-discovery.cjs
```

title、description、canonical、OG、JSON-LD、HTTP status、最終 URL、`content-type`、取得時刻を保存する。検索結果を観測するときは検索エンジン名、検索語、UTC 日時、ログイン状態を併記する。順位や AI 検索での引用は変動するため保証値にしない。

## 変更前の観測

- 2026-10-19 12:29 UTC、直接 HTTP 取得: `/` は 200。title は存在したが description、canonical、OG は見つからなかった。
- 同時刻、`/robots.txt` と `/sitemap.xml` は 404。
- 2026-10-19 12:48 UTC、Bing 通常検索（未ログイン相当の HTTP 取得、`site:shinso-gacha.birdman-studio.com`）: 返却された上位10 organic 結果ブロックに対象ドメインの一致を確認できなかった。これはインデックス未登録の確定判定ではなく、地域・時刻・検索側の応答に依存する観測値。
- ChatGPT、Gemini、Copilot への質問や外部 AI API 送信は実施していない。
