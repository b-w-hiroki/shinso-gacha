# 異変100枚の制作記録

ゲーム内の保存ID 0–99に、assets/incursions/cases/000.webp–099.webpを1対1で割り当てる。旧doorwayは006、今回のpeephole/ceiling/under-chairは091/092/096として採用。残り96枚は個別の画像生成で制作し、色変換や切り抜きだけの画像を別原画として数えない。

Built-in imagegenを使用。各画像を独立して生成し、原画を残してPillowで最大1100pxのWebP（quality 88）へ縮小・圧縮。最初の4点は既存の納品サイズを維持。生成写真内の細かな文字は解答の唯一の根拠にせず、ゲームの原本・現在の記録を併記する。

## 再遭遇時の差分

冷たい色、薄い褐色、彩度を抑えた陰影、原色の4種を、保存された遭遇回数と反復段階から決定。身体・空間・存在の写真には静止／微かな漂い／呼吸のような拡縮を組み合わせる。文字を読む写真は静止。画像を反転しないため、左右・日時の手掛かりを変更しない。タップ位置は変形後の画像矩形から原画座標へ戻して判定。quietでは画像を隠し、reduced-motionでは動きを止める。写真は遭遇時に読み込み、100枚の事前読み込みをしない。

## 基本プロンプト

下記テンプレートに、INCIDENT-IMAGE-INPUTS.jsonの各id/name/reference/phenomenon/afterをそのまま代入。idは3桁。再制作した040・089・090・093–095・097–099の最終プロンプトはINCIDENT-IMAGE-OVERRIDES.jsonを優先。045は左右を確認し、右頬（閲覧者から見て左）へ傷を移す修正を実施。

```text
Use case: stylized-concept. Asset type: dedicated evidence photograph for case {id} in a Japanese psychological horror game. Create ONE landscape 3:2 image, photographic realism. The image must depict this specific phenomenon, not a generic haunted room. Case: {name}. Normal baseline: {reference}. The impossible thing visible now: {phenomenon}. Narrative aftermath for context only: {after}. Ground the photograph in a plausible old Japanese municipal office or the location specified by the case. Make the physical discrepancy clear in a small phone image: use close framing for objects, wider framing only for spatial anomalies. Unsettling ordinary materials, a believable impossible detail, restrained dark olive/tobacco colors, sufficient light to read the subject. No decorative interface, no captions, no watermark, no poster, no collage. Avoid unreadable dense text: when the case depends on time/names, show a focused physical clock/log/device with only the essential short date/time/name, with evidence explanation supplied separately by the game. No gore, blood or injury. No extra unrelated monsters. For human entities, adult figures only. Each image is a separate unique composition for this exact case.
```

## 採用済み4原画のプロンプト

006の原文はANOMALY-CATALOG.mdに記載。残る3点は以下。

# Additional incursion photographs

Generated with the built-in imagegen tool, then resized to 1000px wide WebP for this project. All three originals were inspected. The project uses static photographs without sound or flashing; quiet mode uses the same playable text evidence and trace contact path.

## peephole

Path: assets/incursions/peephole.webp

Use case: stylized-concept. Asset type: Japanese psychological horror browser game evidence photograph, landscape 3:2. Photorealistic deserted old municipal office at night, tobacco brown and muted olive palette, low light but the anomaly is clearly readable on a phone. No text, no logos, no interface, no blood, no injury, no gore. Quiet disturbing realism, no cinematic action. View from inside a locked metal office door through a small circular peephole. An impossibly large human eye on the outside fills the circular opening, staring straight in. Frame the circular opening in the central half of the composition, with aged dark metal surrounding it. Iris and wet eyelids legible, strange proportions.

## ceiling

Path: assets/incursions/ceiling.webp

Use case: stylized-concept. Asset type: Japanese psychological horror browser game evidence photograph, landscape 3:2. Photorealistic deserted old municipal office at night, tobacco brown and muted olive palette, low light but the anomaly is clearly readable on a phone. No text, no logos, no interface, no blood, no injury, no gore. Quiet disturbing realism, no cinematic action. View down a narrow office corridor. A thin adult human-like figure crawls upside down on the ceiling, limbs bent impossibly, head turned back looking directly at us. Entire figure centered in the upper middle, pale face and hands visible against shadows, empty floor underneath. Unmistakably terrifying but non-graphic.

## under-chair

Path: assets/incursions/under-chair.webp

Use case: stylized-concept. Asset type: Japanese psychological horror browser game evidence photograph, landscape 3:2. Photorealistic deserted old municipal office at night, tobacco brown and muted olive palette, low light but the anomaly is clearly readable on a phone. No text, no logos, no interface, no blood, no injury, no gore. Quiet disturbing realism, no cinematic action. Low angle looking at an ordinary empty office chair. Beneath the seat, in the narrow gap above the floor, a flattened pale adult human face looks straight at the viewer, eyes wide open. No body is visible. Chair legs and empty seat clearly define the impossible placement. Face centered around the lower middle, clearly legible.
