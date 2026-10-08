# 写実UI素材 第2弾

既存ガチャの古紙・黒い金属・赤い局所照明に合わせ、12種類を生成して実装。生成は組み込み画像生成ツールを使用。透過PNG出力を、寸法・アルファを維持してWebP品質90へ変換した。背景は非透過。原画の文字はなく、文字・数値・操作・波形・レーダー走査はHTML/CSSで管理する。

## 素材と反映先

すべて `assets/ui/` 配下。共通の表示定義は `assets/physical-ui.css`。

| ファイル | 反映場所 | 制作プロンプトの個別指定 |
| --- | --- | --- |
| civilian-desk.webp | 一般人編の背景 | Portrait 2:3 overhead ordinary worn dark wooden desk at night; subtle warm upper-left lamp; mostly empty center; restrained uneasy atmosphere. |
| civilian-envelope.webp | 一般人編の開封CTA | Closed plain kraft envelope; horizontal 3:2; front-facing overhead; subtle folds and frayed corners; blank center. |
| radar-bezel.webp | ホームのレーダー枠 | Circular weathered blackened brass bezel; four screws; thin outer ring; transparent center and exterior. |
| mission-clipboard.webp | 本日の任務・一括受取 | Portrait clipboard, worn dark wood, top metal clip, large blank ivory sheet; low-contrast center. |
| archive-folder.webp | 本編・一般人編の資料一覧 | Closed horizontal manila folder; top-left tab; worn thick cardstock; uniform pale center. |
| evidence-paper.webp | 一般人編の通知・取得資料、資料詳細、開封結果、証言 | Portrait cream paper; three left binder holes; edge-only stains and fraying; clean center. |
| photo-frame.webp | 異常証拠の防犯カメラ・現場写真 | Landscape aged ivory photo border; small paperclip; completely transparent central opening and exterior. |
| audio-analyzer.webp | 調査室の見出し、異常証拠の音声解析 | Vintage dark-metal recorder; amber analog meters, cassette compartment and knobs; frontal view. |
| report-paper.webp | 調査報告の見出し・診断カード | Portrait official cream sheet; restrained double border and bottom rules; blank central area. |
| appointment-paper.webp | 着任通知・昇格通知 | Heavy ivory document; embossed border; small red wax seal at lower right; blank center. |
| rank-insignia.webp | 疑念pt詳細のランク・着任・昇格通知 | Four coordinated badges in equal 2×2 grid: bronze chevron, silver double chevron, brass triple chevron, gold star and laurel. |
| danger-overlay.webp | 一般人編の危険・接続異常、本編の警告中デスク | Portrait peripheral dusty shadows and deep red local light; central 75% transparent; no bright flashes. |

共通プロンプト指定: photoreal production game asset, warm upper-left illumination, aged paper / dark metal / deep red palette, no text, letters, numerals, logos or baked interface. Props are front-facing and isolated on genuine transparent alpha backgrounds. The desk is the only full opaque background. Individual output dimensions and file sizes are recorded in `assets/ui/physical-manifest.json`.

## 実装上の判断

- 階級章は既存20ランクを5ランクずつ4意匠で表示。ランク名・必要回数・確率補正は変更していない。
- 封筒を開くCTAは封筒素材。イベント確認CTAは既存の赤ボタン枠を使用し、意味を区別。
- 任務は文字の折返しを許容し、受取・一括受取の操作領域を確保。
- 写真枠は既存監視写真と組み合わせ、記録コードはHTML。音声機器上の波形もHTML。
- 危険演出は静的で `pointer-events:none`。中央透過をテストし、任務表示中には本編デスクの警告を重ねない。
- 台紙は背景なので支援技術に重複情報を渡さない。階級章は `aria-hidden`、ランク名を別に表示。
- 描画用の階級章マークアップ以外に、ゲーム進行・報酬・Firebase保存の処理変更はない。

## 検証

- `node tests/smoke.mjs`
- `node tests/photoreal.cjs`: 1/5/10/100連の回数・消費・解放境界、一括受取と重複防止、疑念pt・ランク、ローカル保存、Firebase保存/復元/権限拒否時のアダプター検証。
- `node tests/dossier-ui.cjs`: 320/390/1280幅、画面移動、資料・証言、44px閉じる操作、強化・再調査、保存復元、12画像のデコードと透明な中央、一般人編開封とタブ、危険演出、着任、階級章4段階、昇格通知。
- Firebaseはスタブで検証し、実ユーザーのクラウド保存は変更していない。実機Safariは未検証。
- スクリーンショット: `docs/qa-ui/`。`physical-overview.jpg` は代表画面、`physical-comparison.jpg` はPR #42との比較。
