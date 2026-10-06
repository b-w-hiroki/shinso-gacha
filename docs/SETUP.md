# 公開・運用手順

## 構成

- ホスティング：GitHub Pages（`main` / root）。独自ドメイン `shinso-gacha.birdman-studio.com`
- バックエンド：Firebase（プロジェクト `shinso-gacha`）。Authentication と Firestore のみ
- ビルド工程なし。`index.html` を更新して `main` にプッシュすると、数分で反映される

## GitHub Pages と独自ドメイン

1. Settings → Pages で `main` / `/ (root)` を指定
2. DNS に `CNAME`：`shinso-gacha` → `b-w-hiroki.github.io`（Cloudflare 利用時は Proxy を OFF）
3. Pages の Custom domain に `shinso-gacha.birdman-studio.com` を入力。リポジトリの `CNAME` ファイルは自動で作られる
4. 証明書の発行後、Enforce HTTPS をオン
5. 任意：GitHub の Pages ドメイン認証（TXT）で乗っ取りを防ぐ

## Firebase

1. Authentication → Sign-in method：匿名・Google を有効化（メールは未使用のためオフ推奨）
2. Authentication → Settings → 承認済みドメイン：`shinso-gacha.birdman-studio.com`、`b-w-hiroki.github.io`
3. Firestore Database：本番モード、`asia-northeast1`
4. ルール：`firebase/firestore.rules` を貼って公開（コンソールで手動反映。CLI は未導入）
5. `index.html` 内の `FB_CONFIG` は公開前提の値。守っているのはルール
6. Analytics（GA4）は未使用。入れる場合は同意表示の検討が必要

## 動作確認

- 設定画面の「記録：」が「アカウントに保存済み」になること
- Firestore に `users/{uid}` と `scouts/{uid}` ができること（一般人モードでは `scouts` に書かない）
- 「Googleで記録を引き継ぐ」で別端末に進捗が移ること
- 失敗時はブラウザのコンソールを確認する

## ローカル確認

- `index.html` を直接開くと動く。`file://` ではクラウド保存は無効（端末内保存のみ）
- 初回体験（一般人モード）を見るには、保存データを消すか、シークレットウィンドウで開く
