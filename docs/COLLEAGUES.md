# Observation and colleague dialogue

UI principle: observe → recognize a discrepancy → intervene or disconnect. Keep the scene, status copy and actions in separate rows. Use generous line height and plain borders; no torn raster button frame on the observation screen. Portrait phones keep rest/conversation above navigation. Short landscape screens scroll rather than reduce the image below 180px. Keep all image-space anomaly targets intact.

Horror comes from uncertain testimony and ordinary routines with one wrong detail, rather than progress meters or more visual noise. Three colleagues have four topics with three variants each, six greeting/return lines and one conditional contradiction (43 authored dialogue lines). Topic counters and the contradiction clue survive saves. Opening a conversation does not advance topic variants. Conversation retains the existing global 120-second recovery cooldown; dialogue never adds mental load. Long-term narrative pacing remains to be playtested.

## Conversation navigation

The room and conversations use the dedicated `colleagues` view. The roster explains each person’s role and what to ask them. First contact is saved in `observation.contacts`, separately from recovery counts; each colleague introduces themself, including when entered directly from acquired evidence. Opening or changing topics does not award points or trigger recovery. Existing dialogue variants and the global recovery cooldown are unchanged.

First read the introduction, then choose a topic, read the reply, and explicitly choose another topic. The selected topic remains above the reply. Record testimony offers a direct comparison return. Speaker selection is above the conversation; leaving is below it and keeps the monitor closed. Escape dismisses a modal first, then returns to the roster, then observation. This is in-app navigation, not native browser history. Small or landscape screens can scroll for readable text; all controls remain reachable above the bottom navigation.

## Portrait assets

Generated with built-in imagegen, one generation per portrait; converted to 512px-wide WebP for delivery. No fallback CLI or image editing. Original PNGs preserved in the generation output. Dark facial detail is intentional, while names, roles and distinct outlines identify the speaker.

### 白瀬 / 記録係

Asset: assets/colleagues/shirose.webp

Prompt:

Use case: stylized-concept. Asset type: portrait for a fictional Japanese bureaucratic horror game's dialogue UI. Generate ONE individual portrait, vertical 3:4 composition. Subject: Japanese woman archivist, short straight bob haircut, narrow shoulders, collared office blouse and cardigan, holding a closed thin archive folder against chest; distinct bob-haired silhouette. Photographic cinematic realism, quiet psychological unease, deserted municipal archive office at night, muted olive black and tobacco brown, tiny warm back rim light outlining shoulders and hair. Face almost entirely obscured in natural shadow, no visible identifiable eyes or facial features, no monstrous face. Figure readable as a person even at small thumbnail size; head and upper torso centered, generous safe space around head and shoulders. Dark softly defocused shelves in background, fade gently into nearly black edges. Restrained subtle photographic grain, no scanlines, no grids, no hard frame, no torn edges. No text, labels, logos, badges, watermark, blood, gore or extra people. This is a reusable fictional colleague silhouette, not a UI mockup.

### 榊 / 設備担当

Asset: assets/colleagues/sakaki.webp

Prompt:

Use case: stylized-concept. Asset type: portrait for a fictional Japanese bureaucratic horror game's dialogue UI. Generate ONE individual portrait, vertical 3:4 composition. Subject: Japanese male equipment technician, short slightly untidy hair, broad shoulders, plain work jacket, one hand holding a small coil of disconnected cable at waist; distinct practical broad silhouette. Photographic cinematic realism, quiet psychological unease, deserted municipal archive office at night, muted olive black and tobacco brown, tiny warm back rim light outlining shoulders and hair. Face almost entirely obscured in natural shadow, no visible identifiable eyes or facial features, no monstrous face. Figure readable as a person even at small thumbnail size; head and upper torso centered, generous safe space around head and shoulders. Dark softly defocused shelves in background, fade gently into nearly black edges. Restrained subtle photographic grain, no scanlines, no grids, no hard frame, no torn edges. No text, labels, logos, badges, watermark, blood, gore or extra people. This is a reusable fictional colleague silhouette, not a UI mockup.

### 三輪 / 先輩調査員

Asset: assets/colleagues/miwa.webp

Prompt:

Use case: stylized-concept. Asset type: portrait for a fictional Japanese bureaucratic horror game's dialogue UI. Generate ONE individual portrait, vertical 3:4 composition. Subject: Older Japanese male investigator, slim tall silhouette, longer slightly dishevelled hair, old rumpled suit jacket, narrow necktie, standing in half profile; distinct tall angular silhouette. Photographic cinematic realism, quiet psychological unease, deserted municipal archive office at night, muted olive black and tobacco brown, tiny warm back rim light outlining shoulders and hair. Face almost entirely obscured in natural shadow, no visible identifiable eyes or facial features, no monstrous face. Figure readable as a person even at small thumbnail size; head and upper torso centered, generous safe space around head and shoulders. Dark softly defocused shelves in background, fade gently into nearly black edges. Restrained subtle photographic grain, no scanlines, no grids, no hard frame, no torn edges. No text, labels, logos, badges, watermark, blood, gore or extra people. This is a reusable fictional colleague silhouette, not a UI mockup.


## 未登録立会人の矛盾する人事台帳（2026-10-12）

- 「登録のない立会人」は図鑑上あくまで一人。証拠を実際に2事件以上照合しRANK11相当に達したとき、人事記録と受領台帳の2つの版を同じ人物ファイルから並べて閲覧できる。
- 照合済み3事件＋RANK15相当で「職員ではなく観測対象」という3枚目、さらに当該事件の**実際の翌日観測照合**とRANK18相当で4枚目が増える。追加版を読むことは新しい人物の獲得・ポイント・メールの再取得にならない。
- 版の見た目は独立した二枚以上の紙片。肖像の欠落を意図的な未登録写真枠として保ち、実人物・実名・未入手事件の情報をDOMに出さない。文字が滲む演出は行わず、UIの視認性を優先。
- 条件達成後、ゲーム内人事登録室から一度だけ無報酬の照合通知を送る。受信箱から人物図鑑へ戻れる。旧版保存キー・既存の通知IDは変更しない。
- WebKit/Chromium、390×844画面、レスポンシブ、reduced-motion、メール一度きりを検証。物理iPhoneと本番FirebaseはIssue #75に残る。

## 2026-10-15：再観測が残す立会欄（Issue #82）

- 取得した都市伝説の3断片を実際に照合済みで、同じ観測方式の翌日報告を初回照合し、さらに異なるシーケンスの観測記録を回収した場合だけ、人物図鑑の「登録のない立会人」に **再観測で増えた立会記録** を表示する。
- 再観測が平常に戻った場合・異変区分が変化した場合・同区分が続く場合で別の不穏な文面を表示する。最大3件で、既存の `ForecastFollowup` に保存された有効な観測だけを読取専用で投影する。既存の報告・元の結論・pt・抽選・通知IDを上書きしない。
- 条件が初めて成立すると人事登録室から **訂正されない再観測記録** という無報酬のゲーム内メールが一通だけ届く。メールから当該取得済み人物原本へ戻り、原本の調査報告へも移動できる。古いメールが保存されていても回収証拠が無い場合はリンクを表示しない。
- 未取得の事件名・人物像・別方式の観測記録をDOMへ出さない。将来の予定が現実になる確率や観測地点は変えない。
- 検証はモデル・Smoke・保存互換を基本とする。ブラウザとスクリーンショットによる手動QAは今回の依頼範囲外。実機Safariと本番Firebaseは #75、人物素材と長時間プレイ品質は #82/#89 の残件。

## 2026-10-16：再照合を課員へ伝える第3段階（Issue #176）

- 観測資料を読む → 担当課員に尋ねる → 再照合が表示された取得済み資料だけに「再照合の結果を（課員）に伝える」が出る。16資料それぞれに固有の返答があり、最初の証言の意味を裏返す。
- 伝えた結果は `observation.investigation.confronted[キー]===true` に保存し、資料メモに「照会記録」として再閲覧できる。2回目以降は同じ文面で、pt・回復・会話カウンタ・抽選を変えない。
- 同じ課員へ伝えるたびに会話の導入文が3段階で不穏になる（間→背後の書架→言い終える前に返事）。
- 観測ホームの「証言と資料を再照合する」は、まだ伝えていない資料だけを候補にする。未取得・未読・未証言の資料、文字列の `"true"` は条件を満たさない。

## 2026-10-16：未登録立会人の肖像欄（Issue #175）

- 課員3名と同じ 512×683 WebP の `assets/colleagues/unregistered.webp` を追加。新規生成ではなく、既存3肖像（白瀬・榊・三輪）を画素平均し、彩度を落として周辺減光した派生素材。顔は元素材と同じく影で判別できない。
- 人事ファイルの「肖像欄／該当なし／NO RECORD」の枠は維持し、その背面にだけ薄く表示する。照合済み事件が1件・2件・3件以上で濃度が3段階に上がる（`data-presence`）。名前・実在人物・未取得事件の情報は増やさない。
- 人物図鑑の課員詳細は、面識（`observation.contacts[id]===true`）のない課員を開かない。一覧の未面識表示は従来どおり。
