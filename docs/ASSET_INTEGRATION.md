# 真相ガチャ 写実素材パック (2026-10-08)

`shinso_assets.zip` に含まれる10画像をリポジトリの `assets/` へ配置する。

- desk-background.webp — 机の背景
- envelope.png — 封筒（透過）
- button-paper.png / button-red.png / button-locked.png — ボタン
- classified-files.png / surveillance-photo.png / red-lamp.png / film-canister.png / cassette.png — 装飾

CSSは既存SVGをフォールバックとして指定しているため、画像配置前も既存画面が動作する。ボタン文字とクリック判定はHTMLのまま。

注意: 元画像は合成モックであり、切り抜きの端に背景色が残る箇所がある。画像を貼っただけで完全な透過品質になるわけではない。最終的な実機確認が必要。
