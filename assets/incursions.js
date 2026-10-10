/* Authored evidence cases. Stable append-only ordering preserves saved event IDs. */
const EXTRA_INCURSIONS=[
 {
  "name": "戸口に収まらない首",
  "short": "戸口に収まらない首",
  "reference": "夜間巡回の原本：廊下は無人。扉は高さ二メートル。",
  "records": [
   "扉の上から、人の顔がこちらを覗く",
   "扉の下に清掃用の台車",
   "廊下奥の照明は消灯"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "顔が扉の裏へ折り畳まれた。足音はしなかった。",
  "visual": "doorway"
 },
 {
  "name": "翌朝の死亡報告",
  "short": "翌朝の死亡報告",
  "reference": "現在は八日夜。九日朝の巡回は未実施。",
  "records": [
   "八日夕、巡回完了",
   "九日朝、あなたの遺体を確認",
   "八日夜、引継ぎ完了"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "報告の本文が白紙になった。受領印だけが残った。"
 },
 {
  "name": "先に鳴る終業鐘",
  "short": "先に鳴る終業鐘",
  "reference": "終業鐘は二十三時に一度だけ鳴る。記録の時計は同期済み。",
  "records": [
   "二十二時四十分、勤務中",
   "二十二時四十五分、勤務中",
   "二十二時五十分、終業後と記録"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "鐘の余韻が時計の針に追いついた。"
 },
 {
  "name": "未来の折り返し",
  "short": "未来の折り返し",
  "reference": "こちらからの発信は二時十四分。折り返しはその後になる。",
  "records": [
   "二時十三分、折り返し受信",
   "二時十五分、着信通知",
   "二時十六分、通話終了"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "受話器の向こうで、まだ鳴っていない呼出音が止まった。"
 },
 {
  "name": "戻る秒針",
  "short": "戻る秒針",
  "reference": "点検時計は正方向に進む。逆転の試験は行っていない。",
  "records": [
   "次の秒へ針が進む",
   "直前の秒へ針が戻る",
   "分をまたいで針が進む"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "秒針は進み始めた。同じ一秒だけ、長く感じた。"
 },
 {
  "name": "乾かない昨日",
  "short": "乾かない昨日",
  "reference": "床の清掃は今朝七時に開始。それ以前に洗剤は使用していない。",
  "records": [
   "今朝七時半の床は濡れている",
   "今朝八時のモップは湿っている",
   "昨日夜の床から今朝の洗剤を検出"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "昨日の足跡だけが乾いた。"
 },
 {
  "name": "廃棄より遅い撮影",
  "short": "廃棄より遅い撮影",
  "reference": "フィルムは六日に完全焼却した。複製もない。",
  "records": [
   "七日に同じ原版へ露光",
   "五日に原版を点検",
   "六日に焼却を記録"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "現像槽に、焼けた紙の匂いが戻った。"
 },
 {
  "name": "終わらない一分",
  "short": "終わらない一分",
  "reference": "音声は一分間。再生の繰り返し設定は無効。",
  "records": [
   "十秒地点に足音",
   "一分後も同じ呼吸が続く",
   "四十秒地点に戸の音"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "最後の呼吸だけ、室内で聞こえた。"
 },
 {
  "name": "先回りする訪問者",
  "short": "先回りする訪問者",
  "reference": "来訪予約は明日十時。今日は入館手続き前。",
  "records": [
   "今日の予約台帳に氏名",
   "明日の予定表に氏名",
   "今日の退館簿に予約者の署名"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "退館時刻の欄から、鉛筆の粉が落ちた。"
 },
 {
  "name": "二度目の午前二時",
  "short": "二度目の午前二時",
  "reference": "当直時計に時刻補正はなく、時系列で連続保存する。",
  "records": [
   "二時十五分の次が二時十四分",
   "二時十三分の次が二時十四分",
   "二時十四分の次が二時十五分"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "戻った一分に写っていた椅子だけが空いた。"
 },
 {
  "name": "録音前の返事",
  "short": "録音前の返事",
  "reference": "最初の質問は録音開始から十秒後。それまでは無言。",
  "records": [
   "十二秒地点に返事",
   "五秒地点に質問への返事",
   "十五秒地点に聞き返し"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "返事の波形が、質問の裏へ沈んだ。"
 },
 {
  "name": "先に届く開封音",
  "short": "先に届く開封音",
  "reference": "封筒は二時二十分に開封。それ以前は封緘済み。",
  "records": [
   "二時二十一分、紙を広げる音",
   "二時二十二分、封筒を置く音",
   "二時十九分、封を切る音"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "紙の裂け目が、音もなく閉じた。"
 },
 {
  "name": "日付のない曜日",
  "short": "日付のない曜日",
  "reference": "当直表は月曜から日曜までの七日間。追加勤務日はない。",
  "records": [
   "日曜の次に、誰にも読めない曜日",
   "金曜の次に土曜",
   "土曜の次に日曜"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "余分な欄が縮んだ。そこには毎週、あなたの印があった。"
 },
 {
  "name": "返却済みの借用",
  "short": "返却済みの借用",
  "reference": "鍵の貸出は十九時、返却は二十時。台帳は修正されていない。",
  "records": [
   "十九時、貸出済み",
   "十八時、今回の鍵を返却済み",
   "二十時、保管庫へ収納"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "返却口の奥で、鍵束が一度鳴った。"
 },
 {
  "name": "四階の下の五階",
  "short": "四階の下の五階",
  "reference": "階段は一階ずつ連続する。分岐も中間階もない。",
  "records": [
   "四階から上り五階へ到着",
   "四階から下り三階へ到着",
   "四階から下りて五階へ到着"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "下りたはずの足の疲れだけが残った。"
 },
 {
  "name": "図面にない窓",
  "short": "図面にない窓",
  "reference": "資料庫の北面は地下の土壁。開口部はない。",
  "records": [
   "北面の窓から外の顔が見える",
   "南側の出入口が閉まっている",
   "天井の換気口が回っている"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "土壁の向こうで、指がガラスをなぞった。"
 },
 {
  "name": "増える角",
  "short": "増える角",
  "reference": "この廊下は直線一本。曲がり角は入口と出口だけ。",
  "records": [
   "入口に曲がり角がある",
   "廊下の中央に右折路がある",
   "出口に曲がり角がある"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "角の奥にあった灯りが、壁の中へ消えた。"
 },
 {
  "name": "内側だけの非常口",
  "short": "内側だけの非常口",
  "reference": "非常口は中庭へ通じる。中庭からも同じ扉を確認できる。",
  "records": [
   "扉の室内側に押し棒",
   "扉の中庭側に取っ手",
   "室内に扉があるのに中庭側は壁"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "壁に残った扉の輪郭が、ゆっくり埋まった。"
 },
 {
  "name": "近づかない突き当たり",
  "short": "近づかない突き当たり",
  "reference": "廊下は十メートル。途中に動く床はない。",
  "records": [
   "十メートル進んでも突き当たりまで十メートル",
   "五メートル進むと残り五メートル",
   "入口から突き当たりまで十メートル"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "突き当たりの染みが、初めて近づいた。"
 },
 {
  "name": "天井裏の階段",
  "short": "天井裏の階段",
  "reference": "天井裏は配管だけで、人用の通路は設置されていない。",
  "records": [
   "給水管が通っている",
   "上階へ続く幅広い階段を確認",
   "電線用のトレイが通っている"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "階段の最後の一段で、誰かが立ち止まった。"
 },
 {
  "name": "遠すぎる隣室",
  "short": "遠すぎる隣室",
  "reference": "隣室は共有壁の向こう。両室の扉は三メートル離れている。",
  "records": [
   "隣室の扉が同じ廊下にある",
   "隣室との壁を配線が通る",
   "隣室まで屋外を一時間歩く"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "靴底に、建物にはない赤土が残った。"
 },
 {
  "name": "左右が入れ替わる階段",
  "short": "左右が入れ替わる階段",
  "reference": "踊り場の消火栓は昇る人の右。設備は移動していない。",
  "records": [
   "昇る人の左に消火栓",
   "昇る人の右に消火栓",
   "降りる人の左に消火栓"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "赤い箱の中から、階段を降りる音がした。"
 },
 {
  "name": "部屋番号の続き",
  "short": "部屋番号の続き",
  "reference": "使用中の部屋は一号室から六号室まで。七号室は存在しない。",
  "records": [
   "三号室から内線が入る",
   "七号室から内線が入る",
   "六号室から内線が入る"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "廊下の端で、番号札を裏返す音がした。"
 },
 {
  "name": "鏡の奥の通路",
  "short": "鏡の奥の通路",
  "reference": "壁の鏡は厚さ五ミリ。奥はコンクリート。",
  "records": [
   "鏡面に指紋が残る",
   "鏡の端に欠けがある",
   "鏡の内側へ足跡が続く"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "鏡の奥の足跡が、こちらへ向きを変えた。"
 },
 {
  "name": "閉じた図面の部屋",
  "short": "閉じた図面の部屋",
  "reference": "防災図は現地確認済み。四号室に柱はない。",
  "records": [
   "四号室中央に太い柱が立つ",
   "四号室の壁際に棚",
   "四号室の隅に机"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "柱の陰にいたものだけが見えなくなった。"
 },
 {
  "name": "裏返った出口",
  "short": "裏返った出口",
  "reference": "西口を出ると道路に面する。室内へ戻る構造ではない。",
  "records": [
   "西口を出ると歩道",
   "西口を出ると同じ受付の内側",
   "西口を出ると道路沿いの植木"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "受付の椅子が、今座ったばかりの向きになった。"
 },
 {
  "name": "床下の空",
  "short": "床下の空",
  "reference": "一階の床下は基礎と土。吹き抜けではない。",
  "records": [
   "床の隙間に土が見える",
   "床の隙間に基礎が見える",
   "床の隙間に夜空が広がる"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "隙間から見えた星が、ひとつずつ瞬きをやめた。"
 },
 {
  "name": "開けても別の扉",
  "short": "開けても別の扉",
  "reference": "ロッカー内の奥行きは四十センチ。背板の向こうは壁。",
  "records": [
   "中に同じ大きさの扉が続く",
   "中に一段の棚がある",
   "中に上着が掛かっている"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "内側の扉から、鍵が回された。"
 },
 {
  "name": "影だけ残る当直",
  "short": "影だけ残る当直",
  "reference": "廊下の照明は点灯中。職員は全員退館した。",
  "records": [
   "台車の下に影がある",
   "無人の廊下に立つ人型の影",
   "柱の横に影がある"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "人型の影が、柱の陰へ歩いた。"
 },
 {
  "name": "顔の向きが合わない",
  "short": "顔の向きが合わない",
  "reference": "後ろ向きの人物を背後から撮影。鏡や反射面はない。",
  "records": [
   "肩の後ろ側が写る",
   "背中の名札ひもが写る",
   "後頭部の位置に正面の顔"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "顔がゆっくり、髪の下へ隠れた。"
 },
 {
  "name": "多すぎる手形",
  "short": "多すぎる手形",
  "reference": "清掃後、一人が片手だけで窓を押した。それ以外の接触はない。",
  "records": [
   "左右の手形が三組残る",
   "片手の指跡が五本残る",
   "掌の擦れた跡が残る"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "手形の一組だけが、窓の向こう側に残った。"
 },
 {
  "name": "呼吸のない胸",
  "short": "呼吸のない胸",
  "reference": "胸部センサーは正常。目の前の人物は会話を続けている。",
  "records": [
   "息を吸ってから話す",
   "呼吸停止のまま長く話し続ける",
   "話し終えて息を吐く"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "会話が止まり、遅れて息を吸う音がした。"
 },
 {
  "name": "違う指紋の指",
  "short": "違う指紋の指",
  "reference": "封印済みの指紋原本は本人の右人差し指。傷も移植もない。",
  "records": [
   "右親指は原本と異なる",
   "右人差し指は原本と一致",
   "同じ指から別人の指紋が出る"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "指紋の線が、紙の上で元の形へ戻った。"
 },
 {
  "name": "まばたきの順番",
  "short": "まばたきの順番",
  "reference": "正面の映像を通常速度で再生。特殊メイクは使用していない。",
  "records": [
   "額にある三つ目だけがまばたく",
   "右目がまばたく",
   "左目がまばたく"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "額の皺が閉じた。目は二つに戻った。"
 },
 {
  "name": "立てない姿勢",
  "short": "立てない姿勢",
  "reference": "床と天井は固定され、吊り具も支柱も設置されていない。",
  "records": [
   "両足で床に立っている",
   "床に触れず直立している",
   "椅子に座っている"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "床に着く直前まで、影だけが揺れていた。"
 },
 {
  "name": "数の合わない足音",
  "short": "数の合わない足音",
  "reference": "通路には一人。硬い靴で一定の歩調、反響は一回だけ。",
  "records": [
   "一人分の歩調が聞こえる",
   "歩調に対応する反響が聞こえる",
   "三人分の別々の歩調が聞こえる"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "二人分の足音が、背後で止まった。"
 },
 {
  "name": "うしろの名前",
  "short": "うしろの名前",
  "reference": "職員証は胸に一枚。衣服の背面には印刷も刺繍もない。",
  "records": [
   "背中にあなたの氏名が浮かぶ",
   "胸に職員証がある",
   "首にストラップがある"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "名前の最後の一文字が、肌の下へ沈んだ。"
 },
 {
  "name": "閉じた口の声",
  "short": "閉じた口の声",
  "reference": "映像と音声は同期。口を閉じた人物以外は無人。",
  "records": [
   "鼻から小さな呼吸音",
   "閉じた口から明瞭な呼び声",
   "服の擦れる音"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "声が口元へ戻った。唇だけが遅れて動いた。"
 },
 {
  "name": "増える歯",
  "short": "増える歯",
  "reference": "検診票に歯は二十八本。以後治療も抜歯もない。",
  "records": [
   "検診票どおり二十八本",
   "検診票どおり奥歯に詰め物",
   "口の奥にもう一列の歯"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "奥の歯列が、暗がりの中へ退いた。"
 },
 {
  "name": "反対側の傷",
  "short": "反対側の傷",
  "reference": "本人確認票の傷は左頬。映像は左右反転していない。",
  "records": [
   "同じ形の傷が右頬に移る",
   "左頬に確認票と同じ傷",
   "右頬に傷がない"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "傷が元に戻った。本人だけが痛がらなかった。"
 },
 {
  "name": "脱いだままの形",
  "short": "脱いだままの形",
  "reference": "上着を脱ぎ無人の机に置いた。中に物は入っていない。",
  "records": [
   "上着が机の上に平たく置かれる",
   "上着が人の肩の形で立ち上がる",
   "袖が机から垂れる"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "襟元から、ひと息だけ漏れた。"
 },
 {
  "name": "足の向き",
  "short": "足の向き",
  "reference": "人物は前を向いて直立。靴も足首も正常と確認済み。",
  "records": [
   "つま先が前を向く",
   "かかとが後ろを向く",
   "両足だけが真後ろを向く"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "靴底が床を擦らず、正しい向きへ戻った。"
 },
 {
  "name": "抜いた電源",
  "short": "抜いた電源",
  "reference": "モニタは電源と映像ケーブルを抜き、内蔵電池もない。",
  "records": [
   "映像が更新され続ける",
   "画面が消えている",
   "電源ランプが消えている"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "暗い画面に、最後の一人だけが残像として残った。"
 },
 {
  "name": "無線のない応答",
  "short": "無線のない応答",
  "reference": "この端末は有線専用。ネットワーク線は取り外した。",
  "records": [
   "端末内の保存記録を表示",
   "外部から新しい応答を受信",
   "接続エラーを表示"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "応答の差出人が「室内」に変わって消えた。"
 },
 {
  "name": "レンズ裏の指",
  "short": "レンズ裏の指",
  "reference": "カメラは密閉済み。レンズとセンサーの間に隙間はない。",
  "records": [
   "外側に雨滴が付く",
   "外側に埃が付く",
   "レンズの内側を指が撫でる"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "指の跡は、拭いていない内側から乾いた。"
 },
 {
  "name": "受話器の重さ",
  "short": "受話器の重さ",
  "reference": "受話器には追加部品なし。台座から外すと三百グラム。",
  "records": [
   "持ち上げるほど人一人分の重さになる",
   "秤で三百グラムを示す",
   "台座に戻すと通話が切れる"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "重さが消えた瞬間、床が一度軋んだ。"
 },
 {
  "name": "録音機の呼吸",
  "short": "録音機の呼吸",
  "reference": "録音機は空の防音箱に置いた。録音入力は無効。",
  "records": [
   "無音のファイルが保存される",
   "新しい呼吸音が記録される",
   "録音時間だけが進む"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "防音箱の壁が、内側から曇った。"
 },
 {
  "name": "二つの電池残量",
  "short": "二つの電池残量",
  "reference": "表示と測定器は同じ電池に接続。測定器は正常。",
  "records": [
   "満充電の電池を満充電と表示",
   "空の電池を残量なしと表示",
   "空の電池を満充電と表示"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "残量表示の人型アイコンが消えた。"
 },
 {
  "name": "印刷される空席",
  "short": "印刷される空席",
  "reference": "印刷ジョブは白紙一枚。スキャナもネット接続も停止。",
  "records": [
   "空席に座る人の写真が印刷される",
   "白紙が排出される",
   "印刷履歴に白紙一枚"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "写真の椅子が、現実より少しだけこちらを向いていた。"
 },
 {
  "name": "停めた換気扇",
  "short": "停めた換気扇",
  "reference": "換気扇は固定ピンで回転を止めた。逆流もない。",
  "records": [
   "羽根が停止している",
   "羽根が固定ピンをすり抜けて回る",
   "電源表示が消えている"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "回転音の最後に、小さな笑い声が混ざった。"
 },
 {
  "name": "録画していない赤灯",
  "short": "録画していない赤灯",
  "reference": "カメラは停止中。赤灯は録画中だけ点灯する仕様。",
  "records": [
   "停止中に赤灯が消える",
   "録画中に赤灯が点く",
   "録画していないのに赤灯が点く"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "赤灯が消えた。暗闇に同じ大きさの点が残った。"
 },
 {
  "name": "逆向きの拡声器",
  "short": "逆向きの拡声器",
  "reference": "設備は放送専用。マイクも録音機能も付いていない。",
  "records": [
   "室内の会話を録音して返信",
   "館内放送を再生",
   "放送終了で無音になる"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "放送口から、自分の息だけが返ってこなくなった。"
 },
 {
  "name": "磁気のない扉",
  "short": "磁気のない扉",
  "reference": "磁気錠は停電時に開く仕様。予備電源も切断した。",
  "records": [
   "停電後に開く",
   "停電後も内側から強く引かれる",
   "通電中に施錠する"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "引く力が抜けた。取っ手はまだ温かかった。"
 },
 {
  "name": "切断済みの回転音",
  "short": "切断済みの回転音",
  "reference": "記録媒体を取り外し、駆動モーターも停止している。",
  "records": [
   "停止したモーターが無音",
   "空の媒体スロットが表示される",
   "媒体のない場所から読み取り音"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "読み取り音は、机の下へ移って消えた。"
 },
 {
  "name": "持ち主を呼ぶ計器",
  "short": "持ち主を呼ぶ計器",
  "reference": "計器は数値だけを表示する。音声機能も文字表示もない。",
  "records": [
   "あなたの旧姓を表示する",
   "測定値を数字で表示",
   "測定不能を記号で表示"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "表示がゼロになった。旧姓の最後の画だけが残った。"
 },
 {
  "name": "焦点の合う壁",
  "short": "焦点の合う壁",
  "reference": "カメラは壁面に固定焦点。背後は撮影範囲に入らない。",
  "records": [
   "壁の傷が鮮明に映る",
   "壁に背後の人物が鮮明に映る",
   "壁の掲示物が鮮明に映る"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "壁の人物が目を閉じてから、像が消えた。"
 },
 {
  "name": "書く前の署名",
  "short": "書く前の署名",
  "reference": "報告用紙は今開封した未使用品。筆記はまだしていない。",
  "records": [
   "署名欄が空欄",
   "未使用の用紙番号が印字",
   "あなたの署名が筆圧付きで残る"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "筆圧の溝が、紙の裏へ抜けた。"
 },
 {
  "name": "枚数の増える束",
  "short": "枚数の増える束",
  "reference": "綴じた原本は五枚。封印後に追加や分割はしていない。",
  "records": [
   "閉じるたび六枚目が現れる",
   "通し番号が一から五",
   "綴じ穴が五枚分そろう"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "六枚目の端から、指先のような染みが引いた。"
 },
 {
  "name": "裏側の消印",
  "short": "裏側の消印",
  "reference": "封筒は一枚紙で未開封。消印は郵便局で外側だけに押す。",
  "records": [
   "外側に消印が付く",
   "内側から外へ消印が盛り上がる",
   "外側に切手が貼られる"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "盛り上がりが消え、紙は一度だけ脈打った。"
 },
 {
  "name": "知らない筆跡",
  "short": "知らない筆跡",
  "reference": "報告は白瀬が一人で手書き。途中の代筆はない。",
  "records": [
   "白瀬の筆跡が続く",
   "同じペンのインクが続く",
   "文の途中から別人の筆跡に変わる"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "別人の文字が、一文字ずつ背を向けた。"
 },
 {
  "name": "ページの向こうの息",
  "short": "ページの向こうの息",
  "reference": "文書は乾燥保存済み。生物や湿気は検出されていない。",
  "records": [
   "ページを開くと温かい息が出る",
   "乾いた紙の擦れる音",
   "保管箱と同じ温度"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "息が止まった。次のページだけ、めくれなくなった。"
 },
 {
  "name": "消せない行数",
  "short": "消せない行数",
  "reference": "原本は十行。余白に追記はなく、複写も十行である。",
  "records": [
   "十行目で本文が終わる",
   "十一行目に「まだいる」と現れる",
   "余白が空白のまま"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "十一行目の文字が、紙の縁へ這って消えた。"
 },
 {
  "name": "違う差出人",
  "short": "違う差出人",
  "reference": "封筒の送り状と台帳は同じ発送番号。差出人は総務課。",
  "records": [
   "台帳に総務課と記載",
   "送り状に総務課と記載",
   "封筒の差出人だけがあなたになる"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "自分の名前の輪郭が、送り状へ戻った。"
 },
 {
  "name": "開いた封印",
  "short": "開いた封印",
  "reference": "封緘の割印は左右が連続する。貼り直した跡はない。",
  "records": [
   "割印の片側だけが逆さま",
   "割印の線が左右でつながる",
   "封緘紙が同じ一枚"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "逆さまの印が、紙の中で回転した。"
 },
 {
  "name": "濡れる写真",
  "short": "濡れる写真",
  "reference": "乾燥庫から出した写真。撮影場所も乾いた室内。",
  "records": [
   "写真の表面が乾いている",
   "写真の床から水が滴る",
   "撮影者の靴が乾いている"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "水滴が写真へ戻った。中の床だけが濡れていた。"
 },
 {
  "name": "宛先のない配達",
  "short": "宛先のない配達",
  "reference": "配達先は全て現存する部屋番号。旧番号は利用停止。",
  "records": [
   "三号室へ配達完了",
   "六号室へ配達完了",
   "存在しない七号室へ配達完了"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "廊下の奥で、封筒を受け取る音がした。"
 },
 {
  "name": "燃えない余白",
  "short": "燃えない余白",
  "reference": "試験片は全体が同じ紙。耐火加工はしていない。",
  "records": [
   "本文だけ燃えて余白が人型に残る",
   "端から均一に焦げる",
   "灰が同じ色になる"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "灰の人型は、最後までこちらを向いていた。"
 },
 {
  "name": "先に消える名前",
  "short": "先に消える名前",
  "reference": "職員名簿は書換禁止。退職者名も削除せず保管する。",
  "records": [
   "退職者の名前が残る",
   "読んだ人の名前だけ消える",
   "在職者の名前が残る"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "消えた欄に、まだ乾いていないインクが戻った。"
 },
 {
  "name": "動く付箋",
  "short": "動く付箋",
  "reference": "文書は固定台に置き無風。付箋の貼り直しはしていない。",
  "records": [
   "付箋が貼った場所に残る",
   "付箋の端が静止している",
   "付箋が読む行を先回りする"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "付箋は最後の行で止まった。そこは黒塗りだった。"
 },
 {
  "name": "保管番号の重複",
  "short": "保管番号の重複",
  "reference": "原本ごとに番号は一意。複製は末尾に枝番を付ける。",
  "records": [
   "異なる原本二枚に同一番号",
   "原本と複製で枝番が異なる",
   "別原本に別番号が付く"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "一枚が薄くなった。机の傷だけが透けた。"
 },
 {
  "name": "覚えていない出勤",
  "short": "覚えていない出勤",
  "reference": "本人の入館は今夜二十時が初回。過去ログも照合済み。",
  "records": [
   "二十時の入館ログに本人",
   "今朝の当直写真に本人がいる",
   "今夜の引継ぎ欄に本人"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "写真の自分だけが、疲れた顔をして消えた。"
 },
 {
  "name": "空席への相づち",
  "short": "空席への相づち",
  "reference": "会議の出席は二名。空席は一つで、遠隔参加もない。",
  "records": [
   "二名が互いの発言を記録",
   "空席のマイクが未接続",
   "二名が空席の発言を書き取る"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "メモの主語が消えた。二人とも続きを待っていた。"
 },
 {
  "name": "誰もいない家族写真",
  "short": "誰もいない家族写真",
  "reference": "写真は本人一人で撮影。合成も多重露光もない。",
  "records": [
   "本人の肩に家族の手が重なる",
   "本人の手が二本写る",
   "本人の影が一つ写る"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "肩の手が離れた。服の皺だけは戻らなかった。"
 },
 {
  "name": "知りすぎる留守電",
  "short": "知りすぎる留守電",
  "reference": "電話番号は本日新規発行。以前の利用者は存在しない。",
  "records": [
   "本日の開通通知",
   "十年前のあなた宛の留守電",
   "本日の確認着信"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "古い声が、今の名前を呼び直した。"
 },
 {
  "name": "言っていない合言葉",
  "short": "言っていない合言葉",
  "reference": "合言葉は封印済みで未開示。本人も中身を知らない。",
  "records": [
   "封筒が未開封のまま",
   "認証欄が未入力",
   "同僚があなたの声で合言葉を読む"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "同僚は口を閉じたまま、首だけを傾けた。"
 },
 {
  "name": "昨日の新任者",
  "short": "昨日の新任者",
  "reference": "この課への着任は本日。これまで課内に立ち入っていない。",
  "records": [
   "昨日の歓迎写真に自分がいる",
   "本日の辞令に自分の名前",
   "本日の入館証に自分の写真"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "歓迎の垂れ幕だけが、昨日の日付を保っていた。"
 },
 {
  "name": "忘れられた三人目",
  "short": "忘れられた三人目",
  "reference": "会議録の署名は三名。録音にも三人の声を確認済み。",
  "records": [
   "署名欄に三名分の名前",
   "議事本文は「出席二名」と断言",
   "音声記録に三人分の声"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "空いていた椅子が、机に少し近づいた。"
 },
 {
  "name": "入れ替わる通称",
  "short": "入れ替わる通称",
  "reference": "職員の呼称は名簿の氏名に統一。番号呼びは使わない。",
  "records": [
   "全員が榊を名前で呼ぶ",
   "全員が三輪を名前で呼ぶ",
   "全員が白瀬を「六番」と呼ぶ"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "白瀬が、自分の名札を確かめていた。"
 },
 {
  "name": "同じ夢の報告",
  "short": "同じ夢の報告",
  "reference": "封印した夢の記録は未共有。三人は互いに面識がない。",
  "records": [
   "三枚に同一の未知の住所",
   "三枚に異なる覚醒時刻",
   "三枚に異なる筆跡"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "住所の最後に、あなたの部屋番号が残った。"
 },
 {
  "name": "会う前の礼状",
  "short": "会う前の礼状",
  "reference": "来訪者との面会は明日が初回。通信した記録もない。",
  "records": [
   "明日の来訪予定が届く",
   "先週の面会への礼状が届く",
   "本日の予約確認が届く"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "礼状の折り目から、見覚えのある香りがした。"
 },
 {
  "name": "知らない帰宅路",
  "short": "知らない帰宅路",
  "reference": "職員は正門から退館する。地下通路は施錠されている。",
  "records": [
   "正門の退館ログが残る",
   "正門の警備記録が残る",
   "全員が施錠済みの地下から帰宅したと話す"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "全員の靴底から、同じ地下の砂が落ちた。"
 },
 {
  "name": "抜けた一人分",
  "short": "抜けた一人分",
  "reference": "当直交代は三名から二名へ。一名が正門から退館した。",
  "records": [
   "交代後も三名分の声が続く",
   "交代後の在室札は二名",
   "退館簿に一名の署名"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "三つ目の声は、引継ぎが終わるのを待っていた。"
 },
 {
  "name": "先に知る新人",
  "short": "先に知る新人",
  "reference": "新人への配属先告知は未実施。辞令は封印している。",
  "records": [
   "新人が受付で待つ",
   "新人が未告知の机に私物を置く",
   "新人が配属先を尋ねる"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "私物の写真には、知らない同僚が並んでいた。"
 },
 {
  "name": "思い出せない署名者",
  "short": "思い出せない署名者",
  "reference": "決裁は三輪一名。印影も本人のものと確認済み。",
  "records": [
   "決裁印が三輪のもの",
   "承認ログが三輪の識別子",
   "署名者欄だけが「知らない人」になる"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "誰もその文字を、自分が書いたとは認めなかった。"
 },
 {
  "name": "内側からの爪",
  "short": "内側からの爪",
  "reference": "防火扉の向こうは封鎖した無人区画。動物の侵入もない。",
  "records": [
   "扉の内側から爪で引く音",
   "扉の錠が施錠されている",
   "封鎖テープが切れていない"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "爪音は止まった。扉のこちら側に粉が落ちた。"
 },
 {
  "name": "覗き穴の目",
  "short": "覗き穴の目",
  "reference": "空室の覗き穴は外から室内を見通せない構造。",
  "records": [
   "外側の穴が暗く見える",
   "外側の穴から大きな目がこちらを見る",
   "室内から外の廊下が見える"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "目が閉じた。穴が少しだけ大きくなっていた。"
 },
 {
  "name": "天井を歩くもの",
  "short": "天井を歩くもの",
  "reference": "天井は平らで取っ手なし。上階は閉鎖済み。",
  "records": [
   "天井に照明が固定される",
   "天井に煙感知器が付く",
   "人の手足が天井に張り付いて進む"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "足音は天井から壁へ移り、そこで止まった。"
 },
 {
  "name": "隙間の笑顔",
  "short": "隙間の笑顔",
  "reference": "ロッカーの隙間は三ミリ。中は空で封印済み。",
  "records": [
   "隙間いっぱいに人の笑顔が見える",
   "隙間から暗がりが見える",
   "隙間から背板の端が見える"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "笑顔が縦に細くなり、継ぎ目へ消えた。"
 },
 {
  "name": "扉より長い腕",
  "short": "扉より長い腕",
  "reference": "無人の廊下を封鎖。扉の向こうにも職員はいない。",
  "records": [
   "扉の前に清掃台車がある",
   "扉の両側を長い人の手が握る",
   "扉の横に消火器がある"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "手が扉の向こうへ戻った。片方だけ、関節が逆だった。",
  "visual": "doorway"
 },
 {
  "name": "息をする壁",
  "short": "息をする壁",
  "reference": "壁面は乾いたコンクリート。空洞も可動設備もない。",
  "records": [
   "表面のひびが動かない",
   "壁面温度が一定",
   "壁が胸のように上下する"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "壁が息を止めた。こちらの息だけが大きく聞こえた。"
 },
 {
  "name": "椅子の下の顔",
  "short": "椅子の下の顔",
  "reference": "椅子は床から二十センチ。下は照明で見通せる。",
  "records": [
   "床と座面の間に大人の顔が上向く",
   "床に椅子の影が落ちる",
   "床に小さな紙片がある"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "顔は薄くなった。目だけが最後まで開いていた。"
 },
 {
  "name": "近づく長い首",
  "short": "近づく長い首",
  "reference": "廊下は無人。奥の防火扉は封鎖したまま。",
  "records": [
   "扉の前に誰もいない",
   "扉の上から首だけが曲がって覗く",
   "扉の封鎖票が付いたまま"
  ],
  "answer": 1,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "首が引っ込んだ。扉は一度も開かなかった。",
  "visual": "doorway"
 },
 {
  "name": "水面の歯列",
  "short": "水面の歯列",
  "reference": "手洗い器は空。排水管に生物や異物はない。",
  "records": [
   "排水口の金属格子が見える",
   "排水口に水滴が残る",
   "排水口いっぱいの歯が噛み合う"
  ],
  "answer": 2,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "歯列が奥へ退き、金属の格子に戻った。"
 },
 {
  "name": "背後の拍手",
  "short": "背後の拍手",
  "reference": "室内にはあなた一人。録音再生機器は全て停止。",
  "records": [
   "背後で二人以上の拍手がする",
   "机を叩く自分の音がする",
   "椅子を引く自分の音がする"
  ],
  "answer": 0,
  "clue": "原本と矛盾する記録を一つ選ぶ。",
  "after": "拍手はやんだ。最後の一回だけ、耳元だった。"
 }
];

/* Investigation causes incursions; time away never advances them. */
const INCURSIONS = [
  {name:'写真の中から、こちらを見ている',short:'写真の照合',after:'ベンチ横の人影が消えた。駅の時計だけが動き始めた。'},
  {name:'切ったはずの回線が鳴っている',short:'通信の遮断',after:'受信ランプが消えた。いつもの室内音が戻ってきた。'},
  {name:'宛名が、内側から書き換わる',short:'資料の封印',after:'赤い封印が定着した。封筒の内側の筆音が止まった。'},
  {name:'提出していない報告が、受領されている',short:'受領時刻の照合',after:'受領印が薄れた。あなたの署名も、まだ書かれていない。',reference:'提出簿：報告書の作成は 10月9日 02:14。受領は作成後に行う。',records:['10月9日 02:18 受領','10月8日 23:57 受領','10月9日 02:20 受領'],clue:'作成より先に受領された記録を隔離する。',answer:1},
  {name:'無人の部屋から、応答が届く',short:'内線の照合',after:'内線が黙った。扉の向こうで、受話器を置く音がした。',reference:'夜間使用簿：資料室は白瀬、設備室は榊が使用中。旧会議室は閉鎖済み。',records:['旧会議室 ／ 通話応答あり','資料室 ／ 通話応答あり','設備室 ／ 通話応答あり'],clue:'使用簿と矛盾する内線を隔離する。',answer:0},
  {name:'出勤簿に、一人多い',short:'職員名簿の照合',after:'余分な欄が消えた。隣の椅子には、まだ温度が残っている。',reference:'当直名簿：白瀬、榊の二名。三輪は非番。来訪予定なし。',records:['白瀬 ／ 在室','榊 ／ 在室','あなたの後ろ ／ 在室'],clue:'名簿にない在室記録を隔離する。',answer:2},
  ...EXTRA_INCURSIONS
];

/* Shared interaction grammar; each stable case keeps its own evidence and aftermath. */
const INC_FAMILIES={
 time:{label:'時系列の逆流',material:'時刻記録',method:'sequence',steps:['記録を固定','基準時刻を照合','時系列を閉じる'],seal:'時系列を確定する'},
 space:{label:'空間の矛盾',material:'区画記録',method:'sequence',steps:['入口を封鎖','接続を断つ','出口を封鎖'],seal:'区画を閉鎖する'},
 body:{label:'人の形の異常',material:'目撃記録',method:'contact',seal:'痕跡を隔離する'},
 device:{label:'切れない通信',material:'受信記録',method:'disconnect',seal:'切断を確認する'},
 paper:{label:'原本の侵食',material:'受領記録',method:'sequence',steps:['複製を隔離','原本を固定','封印を押す'],seal:'資料を保管する'},
 memory:{label:'記憶の混入',material:'証言記録',method:'compare',seal:'証言を確定する'},
 presence:{label:'こちらへ来るもの',material:'接触記録',method:'contact',seal:'接触を断つ'}
};
function incursionProfile(kind){
 const family=kind===4?'device':kind===5?'memory':kind===6||kind>=90?'presence':kind>=76?'memory':kind>=62||kind===3?'paper':kind>=48?'device':kind>=34?'body':kind>=20?'space':'time';
 return {family,...INC_FAMILIES[family]};
}
// Rarity is separate from the encounter's escalating difficulty tier.
const INC_RARITIES=[
 {id:'N',weight:60,cases:[]},
 {id:'R',weight:28,cases:[1,4,8,11,14,17,20,22,24,26,28,30,32,35,36,37,38,41,42,44,46,50,55,60,65,70,75,80,84,88]},
 {id:'SR',weight:10,cases:[34,39,40,43,45,47,79,85,89,90,93,94,95,97,98]},
 {id:'SSR',weight:2,cases:[6,91,92,96,99]}
];
INC_RARITIES[0].cases=INCURSIONS.map((_,i)=>i).filter(i=>!INC_RARITIES.slice(1).some(r=>r.cases.includes(i)));
function incursionRarity(kind){return INC_RARITIES.find(r=>r.cases.includes(kind));}
function drawIncursionKind(a){
 let roll=Math.random()*100,rarity=INC_RARITIES.at(-1);
 for(const r of INC_RARITIES){if(roll<r.weight){rarity=r;break;}roll-=r.weight;}
 const previous=a.history?.at(-1)?.kind;
 const candidates=rarity.cases.filter(k=>k!==previous);
 return candidates[Math.floor(Math.random()*candidates.length)];
}
const INC_VISUALS={
 doorway:{alt:'扉の上から長い首を曲げた人影が覗いている。',target:[.5,.42]},
 peephole:{alt:'覗き穴の向こうを巨大な目が塞いでいる。',target:[.5,.5]},
 ceiling:{alt:'人の形をしたものが、床ではなく天井を這っている。',target:[.53,.24]},
 'under-chair':{alt:'椅子の座面と床の狭い隙間から、人の顔が見上げている。',target:[.51,.69]}
};
// Every stable event owns one unique photograph. Keep legacy target metadata.
const INC_TARGETS={6:[.5,.42],34:[.72,.55],35:[.48,.28],36:[.45,.44],37:[.25,.79],38:[.62,.64],39:[.5,.28],40:[.49,.69],41:[.59,.52],43:[.42,.48],44:[.65,.49],45:[.54,.47],47:[.5,.68],90:[.5,.48],93:[.36,.49],94:[.34,.25],95:[.58,.46],97:[.6,.24],98:[.5,.5],99:[.22,.32],91:[.5,.5],92:[.53,.24],96:[.51,.69]};
INCURSIONS.forEach((p,id)=>{
 const key='cases/'+String(id).padStart(3,'0');
 INC_VISUALS[key]={alt:p.records?p.records[p.answer]:p.name,target:INC_TARGETS[id]||[.5,.5],targets:id===94?[[.34,.25],[.75,.23]]:id===99?[[.22,.32],[.8,.32]]:null};
 p.visual=key;
});
function incursionVariant(a,e){
 if(a.quiet)return 'still';
 let seed=((a.resolved+1)*2654435761+e.kind*104729+(e.round||0)*8191)>>>0;
 seed^=seed>>>16;seed=Math.imul(seed,2246822507)>>>0;seed^=seed>>>13;
 return ['cold','dusk','hollow','still'][seed>>>0&3];
}
function incursionMotion(a,e){
 if(a.quiet||typeof REDUCED!=='undefined'&&REDUCED)return 'still';
 if(['paper','time','device','memory'].includes(incursionProfile(e.kind).family))return 'still';
 return ['still','drift','breathe'][(a.resolved+e.kind+(e.round||0))%3];
}
function incursionPhoto(a,e,contact=false){
 const p=INCURSIONS[e.kind],v=INC_VISUALS[p.visual],variant=incursionVariant(a,e);
 const img=`<img src="assets/incursions/${p.visual}.webp" alt="${contact?'':v.alt}" decoding="async">`;
 if(contact)return `<button class="inc-contact-photo inc-case-photo" data-variant="${variant}" data-motion="${incursionMotion(a,e)}" data-contacted="${(e.contacts||0)>0}" data-inc="contact-photo" aria-label="${v.alt} 異変の付近を繰り返しタップ。キーボードでは下の痕跡ボタンから対処。">${img}</button>`;
 return `<figure class="inc-presence inc-case-photo" data-variant="${variant}" data-motion="${incursionMotion(a,e)}">${img}<figcaption>${incursionRarity(e.kind).id} ／ 現地から届いた記録</figcaption></figure>`;
}

function incursionEvidenceHTML(a,e){
 const p=INCURSIONS[e.kind],profile=incursionProfile(e.kind),shift=(a.resolved*17+Math.floor(a.resolved/3)+e.round)%3;
 const visual=p.visual&&INC_VISUALS[p.visual],preview=visual&&!a.quiet&&!e.inspect;
 const reference=`<article class="inc-reference"><h3>保管された原本</h3><p>${p.reference}</p></article>`;
 if(preview)return `${incursionPhoto(a,e)}${reference}<button class="inc-primary" data-inc="inspect">原本と照合して対処する</button>`;
 const comparing=profile.method==='compare',view=e.compare||'current';
 const compare=comparing?`<div class="inc-grid"><button data-inc="original" aria-pressed="${view==='original'}">保管された証言</button><button data-inc="current" aria-pressed="${view==='current'}">現在の証言</button></div>`:'';
 if(e.step===0){
 const choices=`<div class="inc-experience inc-experience-${profile.family}" data-case="${e.kind}"><div class="inc-material">${profile.material} ／ ${String(e.kind+1).padStart(3,'0')}</div><div class="inc-records">${p.records.map((_,i)=>{const ix=(i+shift)%3;return `<button data-inc="isolate" data-value="${ix}" ${comparing&&e.seen!==3?'disabled':''}><span class="inc-record-number" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><span>${p.records[ix]}</span></button>`;}).join('')}</div></div>`;
 return `${compare}${comparing&&view==='current'?'':reference}<p class="inc-instruction">${comparing&&e.seen!==3?'保管された証言と現在の証言を両方開いて見比べる。':p.clue}</p>${comparing&&view==='original'?'':choices}<button class="inc-primary" data-inc="quarantine" disabled>${profile.seal}</button>`;
 }
 let controls='',instruction='';
 if(profile.method==='sequence'){
  instruction=`封鎖手順：${profile.steps.join(' → ')}。次は「${profile.steps[e.work||0]||'最終確認'}」。`;
  controls=`<div class="inc-procedure">${profile.steps.map((label,i)=>`<button data-inc="procedure" data-value="${i}" ${i<(e.work||0)?'disabled':''}>${i<(e.work||0)?'封済 ／ ':''}${label}</button>`).join('')}</div>`;
 }else if(profile.method==='disconnect'){
  instruction='入力と出力の両方を切る。片方だけでは、応答が戻ってくる。';
  controls=`<div class="inc-grid">${['入力を切断','出力を切断'].map((label,i)=>`<button data-inc="wire" data-value="${i}" ${(e.wires||0)&(1<<i)?'disabled':''}>${(e.wires||0)&(1<<i)?'切断済み':label}</button>`).join('')}</div>`;
 }else if(profile.method==='contact'){
  instruction='残っている異変を繰り返しタップする。手応えが消えたら、下のボタンで対処を完了。';
  controls=visual&&!a.quiet?incursionPhoto(a,e,true):'';
  controls+=`<button class="inc-contact-trace" data-inc="contact">${visual&&!a.quiet?'痕跡に触れる':p.records[p.answer]}<small>${e.contacts>=5?'手応えが消えた':'この痕跡に繰り返し触れる'}</small></button>`;
 }else instruction='両方の証言と食い違う箇所を照合しました。下のボタンで対処を完了。';
 const ready=incursionWorkDone(e);
 return `<div class="inc-selected"><span>${profile.material} ／ 隔離中</span><p>${p.records[p.answer]}</p></div><p class="inc-instruction">${ready?'干渉が止まった。下の「'+profile.seal+'」で対処を完了。':instruction}</p>${ready?'':controls}<button class="inc-primary" data-inc="quarantine" ${ready?'':'disabled'}>${profile.seal}</button>`;
}
function incursionWorkDone(e){
 if(e.step!==1)return false;
 const method=incursionProfile(e.kind).method;
 return method==='sequence'?(e.work||0)>=3:method==='disconnect'?e.wires===3:method==='contact'?(e.contacts||0)>=5:true;
}

function incursionState(create=false) {
  if (!S.incursion && !create) return null;
  let a=S.incursion;
  if (!a || a.version!==1) a=S.incursion={version:1,level:0,resolved:0,cooldown:0,event:null,quiet:false,history:[]};
  const int=(v,max)=>Math.max(0,Math.min(max,Math.floor(Number(v)||0)));
  a.level=int(a.level,100);a.resolved=int(a.resolved,999999);a.cooldown=int(a.cooldown,5);
  a.manual=int(a.manual ?? a.resolved,999999);a.samples=int(a.samples,999999);
  a.defense=a.defense&&typeof a.defense==='object'?a.defense:{};
  for(const [id,max] of [['ward',3],['recovery',3],['guardian',2]])a.defense[id]=int(a.defense[id],max);
  a.autoWait=int(a.autoWait,6);a.autoEnabled=a.autoEnabled!==false;
  a.history=Array.isArray(a.history)?a.history.filter(h=>h&&Number.isInteger(h.kind)&&INCURSIONS[h.kind]).slice(-8):[];
  a.discovered=Object.fromEntries(Object.entries(a.discovered&&typeof a.discovered==='object'&&!Array.isArray(a.discovered)?a.discovered:{}).filter(([k,v])=>/^\d+$/.test(k)&&Number(k)<INCURSIONS.length&&v===true));
  for(const h of a.history)a.discovered[h.kind]=true;
  delete a.deck;
  a.duplicates=int(a.duplicates,999999);a.researchSpent=int(a.researchSpent,a.duplicates);
  a.claimedMilestones=Array.isArray(a.claimedMilestones)?[...new Set(a.claimedMilestones.filter(n=>[10,25,50,100].includes(n)))]:[];
  a.discussed=a.discussed&&typeof a.discussed==='object'&&!Array.isArray(a.discussed)?a.discussed:{};
  if(a.event){if(!Number.isInteger(a.event.kind)||!INCURSIONS[a.event.kind])a.event=null;else {a.event.step=int(a.event.step,2);a.event.seen=int(a.event.seen,3);a.event.tier=Math.max(1,int(a.event.tier||1,3));a.event.round=int(a.event.round,2);a.event.work=int(a.event.work,3);a.event.wires=int(a.event.wires,3);a.event.contacts=int(a.event.contacts,5);}}
  if(a.level>=36&&!a.event)a.event=incursionEvent(a);
  return a;
}
function incursionEvent(a) {
  if(a.event)return a.event;
  const unlocked=a.manual>=8?3:a.manual>=3?2:1;
  return {kind:drawIncursionKind(a),step:0,seen:0,tier:1+(a.resolved%unlocked),round:0};
}
function incursionBlocked() {
  const a=incursionState();
  if(a&&a.level>=100&&a.event){openIncursion();return true;}
  return false;
}
function incursionInvestigate(count=1) {
  if (typeof introActive==='function'&&introActive()) return;
  if(typeof watchPursue==='function')watchPursue(count>1?5:2);
  const a=incursionState(true);
  if(a.autoWait>0)a.autoWait--;
  if(a.cooldown>0)a.cooldown--;
  else a.level=Math.min(100,a.level+Math.ceil((count>1?8:4)*(1-a.defense.ward*.15)));
  if(a.level>=36&&!a.event)a.event=incursionEvent(a);
  if(a.event&&a.autoEnabled&&a.defense.guardian>=a.event.tier&&a.autoWait===0){
    incursionResolve(true);a.autoWait=8-2*a.defense.guardian;
  }
  // Caller persists with the normal draw transaction.
  renderIncursion();
}
function renderIncursion() {
  const b=document.getElementById('incursion-status');if(!b)return;
  const a=incursionState(),visible=!!a&&!(typeof introActive==='function'&&introActive());
  b.hidden=!visible||!a.event;
  const stage=!visible||!a.level?'calm':a.level<36?'trace':a.level<70?'noticed':a.level<100?'close':'breach';
  document.body.dataset.incursion=stage;
  document.body.classList.toggle('incursion-quiet',!!a?.quiet);
  if(typeof renderPlayerSeepage==='function')renderPlayerSeepage();
  if(!visible)return;
  const label={calm:'静穏',trace:'違和感',noticed:'観測されている',close:'侵入の兆候',breach:'開封を一時停止'}[stage];
  const text=`${label}${a.event?' Lv.'+a.event.tier:''} ${a.level}/100　｜　${a.event?'対処する':'対処記録'}`;
  if(b.textContent!==text)b.textContent=text;
  if(typeof renderRadar==='function')renderRadar();
  b.setAttribute('aria-label',`異変の危険度 ${a.level} / 100。${label}。${a.event?'対処画面を開く':'対処記録を開く'}`);
}
let incursionReturnFocus=null;
function openIncursion() {
  const d=document.getElementById('incursion-dialog');
  if(!d.open){incursionReturnFocus=document.activeElement;d.showModal();}
  drawIncursion();
}
function closeIncursion() {
  document.getElementById('incursion-dialog').close();
  if(incursionReturnFocus?.isConnected)incursionReturnFocus.focus({preventScroll:true});
}
function drawIncursion(message='') {
  const a=incursionState(true),e=a.event,d=document.getElementById('incursion-dialog');
  d.classList.remove('inc-record-mode');
  d.dataset.disturbance=String(e&&!a.quiet?(a.level>=100?3:a.level>=70?2:1):0);
  const heading=e?INCURSIONS[e.kind].name:a.level?'まだ、違和感だけ。':'日常に、戻った。';
  let content='';
  if(e?.kind===0){
    content=`<figure class="inc-photo"><img src="assets/intro/station-${e.view==='before'?'before':'after'}.webp" alt="${e.view==='before'?'記録写真。左の柱に1人。':'現在の写真。右のベンチ横に人物が増えている。'}"><figcaption>${e.view==='before'?'記録写真：左の柱に1人':'現在：右のベンチ横にもう1人'} ／ 02:14</figcaption></figure><div class="inc-grid"><button data-inc="before" aria-pressed="${e.view==='before'}">記録を見る</button><button data-inc="after" aria-pressed="${e.view!=='before'}">現在を見る</button></div><p class="inc-instruction">${e.seen===3?'② 増えた人影の場所を下から選ぶと、対処が進みます。':'① 「記録を見る」「現在を見る」の両方を押して見比べる。'}</p><div class="inc-grid three">${['左の柱','右のベンチ','駅の時計'].map((s,i)=>`<button data-inc="identify" data-value="${i}" ${e.seen===3?'':'disabled'}>${s}</button>`).join('')}</div>`;
  }else if(e?.kind===1){
    content=`<div class="inc-radio" aria-hidden="true"><i></i><i></i><i></i><span>02:14 / INCOMING</span></div><p class="inc-instruction">${e.step===1?'② 下の「CH.02の接続を遮断」を押して完了。':'① 送信元が「不明」の回線を選ぶ。選択後に遮断できます。'}</p><div class="inc-channels">${['管理室','不明','第六文書課'].map((s,i)=>`<button data-inc="channel" data-value="${i}" aria-pressed="${e.step===1&&i===1}"><span>CH.0${i+1}</span><strong>${s}</strong><small>${i===1?'切断後も受信中':'認証済み'}</small></button>`).join('')}</div><button class="inc-primary" data-inc="disconnect" ${e.step===1?'':'disabled'}>CH.02の接続を遮断</button>`;
  }else if(e?.kind===2){
    content=`<div class="inc-envelope"><span>封緘手順 ／ ${e.step} / 3</span><p>差出人 → 宛名 → 本文</p><div class="inc-seals">${['差出人','宛名','本文'].map((s,i)=>`<button data-inc="seal" data-value="${i}" ${i<e.step?'disabled':''}><b>${i<e.step?'封済':i+1}</b><span>${s}</span></button>`).join('')}</div></div><p class="inc-instruction">次は「${['差出人','宛名','本文'][e.step]}」を押す。差出人 → 宛名 → 本文の順に封印します。</p>`;
  }else if(e&&INCURSIONS[e.kind].records){
    content=incursionEvidenceHTML(a,e);
  }else{
    const last=a.history.at(-1);
    content=`<div class="inc-settled"><span>${a.level?'異変の兆候を観測中':'接続は安定しています'}</span><strong>${Object.keys(a.discovered).filter(k=>INCURSIONS[k]).length}件の記録を保管</strong><p>${last?INCURSIONS[last.kind].after:'調査を進めると、写真・通信・資料に異変が現れます。'}</p></div><p class="inc-instruction">${a.cooldown?`次の${a.cooldown}回の開封までは保護区間。`:'異変は開封を進めたときだけ蓄積します。'}<br>時間の経過や留守中には悪化しません。</p><button class="inc-primary" data-inc="close">調査に戻る</button>`;
  }
  if(e&&e.kind<3&&!a.quiet&&!e.seen&&!e.step)content=incursionPhoto(a,e)+content;
  d.innerHTML=`<div class="inc-heading"><span>第六文書課 ／ 異変対処</span><button data-inc="close" aria-label="異変対処を閉じる">×</button></div><h2 id="incursion-title" tabindex="-1">${heading}</h2><div class="inc-meter"><span>危険度 <b>${a.level} / 100</b></span><meter min="0" max="100" low="36" high="70" optimum="0" value="${a.level}" aria-label="危険度"></meter></div>${e?`<p class="inc-tier">異変 Lv.${e.tier} ／ ${['局所的な異変','反復する干渉','深層からの侵入'][e.tier-1]}<br>鎮静手順 ${e.round+1} / ${e.tier} ・ 手動完了で対策資料 +${e.tier}</p>`:''}${content}<p class="inc-feedback" role="status">${message|| (a.level>=100?'対処すると新しい開封を再開できます。資料・ptは失われません。':e?'対処で危険度を0に戻す。見送って調査を続けると上昇します。':'対処記録を保管しました。')}</p><button class="inc-primary" data-inc="records">保管された異変を見る</button>${incursionDefenseHTML(a)}<details class="inc-details"><summary>演出設定・出現率・直近の対処</summary><p>異変発生時の希少度：N 60％ ／ R 28％ ／ SR 10％ ／ SSR 2％。同じ希少度の中では均等抽選。直前と同じ異変は候補から除外します。希少度と対処Lv.は別です。</p><label><input type="checkbox" data-inc="quiet" ${a.quiet?'checked':''}> 異変の画面演出を控えめにする</label><p>ゲーム内の異変です。この対処演出には点滅・大音量・放置中の悪化はありません。</p><ol>${a.history.slice().reverse().map(h=>`<li>${INCURSIONS[h.kind].short} Lv.${h.tier||1}：${h.auto?'自動':'手動'}鎮静</li>`).join('')||'<li>対処記録はまだありません。</li>'}</ol></details>`;
  d.querySelector('h2').focus({preventScroll:true});
}
// Acquired records only; browsing never advances a live encounter.
function openIncursionRecords(kind=null, fromList=false) {
  const a=incursionState(true), d=document.getElementById('incursion-dialog');
  const owned=Object.keys(a.discovered).map(Number).filter(k=>INCURSIONS[k]).sort((a,b)=>a-b);
  if(kind!==null&&(!Number.isInteger(kind)||!owned.includes(kind)))return;
  if(!d.open){incursionReturnFocus=document.activeElement;d.showModal();}
  const p=kind===null?null:INCURSIONS[kind],at=owned.indexOf(kind);
  const photo=p&&!a.quiet?`<figure class="inc-record-photo"><img src="assets/incursions/${p.visual}.webp" alt="${INC_VISUALS[p.visual].alt}" decoding="async"><figcaption>${a.reconstructed?.[kind]?'照合で復元':'保管写真'} ／ ${String(kind+1).padStart(3,'0')} ／ ${incursionRarity(kind).id}</figcaption></figure>`:'';
  const content=p?`${photo}${a.quiet?'<p>控えめな演出設定のため、写真を伏せています。</p>':''}${p.reference?`<article class="inc-reference"><h3>保管された原本</h3><p>${p.reference}</p></article>`:''}<article class="inc-record-aftermath"><h3>鎮静後の記録</h3><p>${p.after}</p></article><button class="inc-primary" data-inc-witness="${kind}">${incursionWitnessMember(kind).name}にこの記録を聞く</button>${typeof legendIncidentLinks==='function'?legendIncidentLinks(kind):''}`:
    `<p>封筒調査で保管した記録 ${owned.length}件。現地観測の16記録とは別に保管します。</p>${incursionCollectionActions(a)}${owned.length?`<div class="inc-record-list">${owned.map(k=>`<button data-inc="record" data-value="${k}"><span>${String(k+1).padStart(3,'0')}</span><strong>${INCURSIONS[k].short}<small class="inc-rarity">${incursionRarity(k).id}</small></strong><span aria-hidden="true">›</span></button>`).join('')}</div>`:'<p class="inc-instruction">まだ保管された記録はありません。封筒の調査中に現れた異変を鎮めると、ここに残ります。</p>'}`;
  const navigation=p?`<div class="inc-grid"><button data-inc="record" data-value="${owned[at-1]}" ${at===0?'disabled':''}>前の記録</button><button data-inc="record" data-value="${owned[at+1]}" ${at===owned.length-1?'disabled':''}>次の記録</button></div><button class="inc-primary" data-inc="records" data-value="${kind}">記録一覧に戻る</button>`:`<button class="inc-primary" data-inc="open">${a.event?'進行中の異変に戻る':'対処状況を見る'}</button>`;
  d.classList.add('inc-record-mode');
  d.innerHTML=`<div class="inc-heading"><span>第六文書課 ／ 異変記録</span><button data-inc="close" aria-label="異変記録を閉じる">×</button></div><h2 id="incursion-title" tabindex="-1">${p?p.name:'保管された異変'}</h2><div class="inc-record-body">${content}</div><footer class="inc-record-nav">${navigation}</footer>`;
  d.scrollTop=0;
  const target=fromList?d.querySelector(`[data-inc="record"][data-value="${fromList}"]`):null;
  (target||d.querySelector('h2')).focus({preventScroll:true});
  if(target)target.scrollIntoView({block:'nearest',behavior:'instant'});
}
function incursionResolve(auto=false) {
  const a=incursionState();if(!a?.event)return;
  const e=a.event;
  if(!auto&&e.round+1<e.tier){
    e.round++;e.step=0;e.seen=0;delete e.view;delete e.work;delete e.wires;delete e.contacts;delete e.compare;
    markDirty();drawIncursion(`干渉が戻ってきた。残り${e.tier-e.round}手順で完全鎮静。`);return;
  }
  if(!auto){a.samples=Math.min(999999,a.samples+e.tier);a.manual++;}
  if(!auto&&a.discovered[e.kind])a.duplicates=Math.min(999999,a.duplicates+1);
  a.discovered[e.kind]=true;
  a.history.push({kind:e.kind,tier:e.tier,auto});a.history=a.history.slice(-8);a.resolved++;a.event=null;a.level=0;a.cooldown=2+a.defense.recovery;
  markDirty();renderIncursion();renderIncursionDefense();
  if(!auto)drawIncursion(`異変を鎮めました。対策資料 +${e.tier}。危険度が0に戻りました。`);
}
const INC_DEFENSE = [
  {id:'ward',name:'遮蔽結界',max:3,effect:l=>`侵食の蓄積を${l*15}%軽減`},
  {id:'recovery',name:'保護符',max:3,effect:l=>`対処後${2+l}回の開封を保護`},
  {id:'guardian',name:'自律封印装置',max:2,effect:l=>l?`Lv.${l}以下を自動鎮静・再充填${8-2*l}開封`:'自動対処なし'}
];
function incursionDefenseHTML(a) {
  return `<details class="inc-defense"><summary>対抗策を育てる ・ 対策資料 ${a.samples}</summary><p>手動鎮静で異変Lv.と同数の資料を獲得。自動鎮静では獲得しません。手動3件でLv.2、8件でLv.3が混ざります（現在${a.manual}件）。</p>${INC_DEFENSE.map(u=>{const l=a.defense[u.id],cost=2*(l+1);return `<article><h3>${u.name} Lv.${l}/${u.max}</h3><p>${u.effect(l)}${l<u.max?` → ${u.effect(l+1)}`:''}</p><button type="button" data-inc-up="${u.id}" ${l>=u.max||a.samples<cost?'disabled':''}>${l>=u.max?'最大強化':`強化する（対策資料 ${cost}）`}</button></article>`;}).join('')}<label><input type="checkbox" data-inc-auto ${a.autoEnabled?'checked':''}> 自動対処を有効にする</label><p>${a.defense.guardian?`自動装置：${a.autoWait?`再充填まで${a.autoWait}回開封`:'待機中'}。Lv.3は手動対処。`:'装置を強化すると自動対処が使えます。'}留守中には進みません。</p></details>`;
}
function renderIncursionDefense() {
  const root=document.getElementById('incursion-defense');if(root)root.innerHTML=incursionDefenseHTML(incursionState()||{samples:0,manual:0,defense:{ward:0,recovery:0,guardian:0},autoWait:0,autoEnabled:true});
}
function upgradeIncursionDefense(id) {
  const u=INC_DEFENSE.find(u=>u.id===id);if(!u)return;
  const a=incursionState(true),l=a.defense[id],cost=2*(l+1);
  if(l>=u.max||a.samples<cost)return;
  a.samples-=cost;a.defense[id]++;markDirty();renderIncursionDefense();
  const root=document.getElementById('incursion-defense');if(root?.querySelector('details'))root.querySelector('details').open=true;
  if(document.getElementById('incursion-dialog').open){drawIncursion(`${u.name}を強化しました。`);document.querySelector('#incursion-dialog .inc-defense').open=true;}
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-inc-up]');if(b&&!b.disabled)upgradeIncursionDefense(b.dataset.incUp);});
document.addEventListener('change',e=>{if(e.target.matches('[data-inc-auto]')){incursionState(true).autoEnabled=e.target.checked;markDirty();renderIncursionDefense();}});
function incursionAction(action,value,source='') {
  const a=incursionState(),e=a?.event;if(!e)return;
  let message='',wrong=false;
  if(INCURSIONS[e.kind]?.visual&&action==='inspect'){e.inspect=true;markDirty();drawIncursion('原本と違う記録を一つ選び、最後に封鎖してください。');return;}
  if(e.kind===0&&['before','after'].includes(action)){e.view=action;e.seen|=action==='before'?1:2;}
  else if(e.kind===0&&action==='identify'&&e.seen===3){if(value===1)return incursionResolve();wrong=true;}
  else if(e.kind===1&&action==='channel'){if(value===1){e.step=1;message='未認証回線を隔離しました。遮断してください。';}else wrong=true;}
  else if(e.kind===1&&action==='disconnect'&&e.step===1)return incursionResolve();
  else if(e.kind===2&&action==='seal'){if(value===e.step){if(e.step===2)return incursionResolve();e.step++;message=`${e.step}か所を封印。次の場所を押してください。`;}else if(value>e.step)wrong=true;}
  else if(INCURSIONS[e.kind]?.records&&['original','current'].includes(action)&&incursionProfile(e.kind).method==='compare'){
    e.compare=action;e.seen|=action==='original'?1:2;
  }
  else if(INCURSIONS[e.kind]?.records&&action==='procedure'&&e.step===1&&incursionProfile(e.kind).method==='sequence'){
    if(value===(e.work||0)){e.work=(e.work||0)+1;message='封鎖が定着した。';}else if(value>(e.work||0)){wrong=true;message='順番が違う。原本の手順へ戻る。';}
  }
  else if(INCURSIONS[e.kind]?.records&&action==='wire'&&e.step===1&&incursionProfile(e.kind).method==='disconnect'&&[0,1].includes(value)){
    e.wires=(e.wires||0)|(1<<value);message=e.wires===3?'両方の回線が黙った。':'もう片方から、まだ応答がある。';
  }
  else if(INCURSIONS[e.kind]?.records&&action==='contact'&&e.step===1&&incursionProfile(e.kind).method==='contact'){
    e.contacts=Math.min(5,(e.contacts||0)+1);message=e.contacts===5?'指先の抵抗が消えた。':'指先に抵抗がある。まだ、そこにいる。';
  }
  else if(INCURSIONS[e.kind]?.records&&action==='isolate'){
    if(incursionProfile(e.kind).method==='compare'&&e.seen!==3)return;
    if(value===INCURSIONS[e.kind].answer){e.step=1;message='原本と一致しない。残った干渉を止めてください。';}else {e.step=0;wrong=true;}
  }
  else if(INCURSIONS[e.kind]?.records&&action==='quarantine'&&incursionWorkDone(e))return incursionResolve();
  else return;
  if(wrong){a.level=Math.min(100,a.level+6*e.tier);message=`異変が近づいた（危険度 +${6*e.tier}）。手掛かりを確認して、もう一度。`;}
  markDirty();renderIncursion();drawIncursion(message);
  const next=e.kind===0&&e.seen===3?'[data-inc="identify"]':e.kind===2?`[data-inc="seal"][data-value="${e.step}"]`:e.step===1?'.inc-primary:not(:disabled),.inc-procedure button:not(:disabled),[data-inc=wire]:not(:disabled),.inc-contact-trace':null;
  if(next){const selector=source==='photo'&&!incursionWorkDone(e)?'.inc-contact-photo':next;const button=document.querySelector('#incursion-dialog '+selector);button?.focus({preventScroll:true});if(source!=='photo'||incursionWorkDone(e))button?.scrollIntoView({block:'nearest',behavior:'instant'});}

}
document.addEventListener('click',event=>{
  const b=event.target.closest('[data-inc]');if(!b||b.disabled)return;
  if(b.dataset.inc==='records')return openIncursionRecords(null,b.dataset.value??false);
  if(b.dataset.inc==='record')return openIncursionRecords(Number(b.dataset.value));
  if(b.dataset.inc==='open')return openIncursion();
  if(b.dataset.inc==='close')return closeIncursion();
  if(b.dataset.inc==='quiet')return;
  if(b.dataset.inc==='contact-photo'){
    const a=incursionState(),e=a?.event,v=e&&INC_VISUALS[INCURSIONS[e.kind]?.visual];if(!v||event.detail===0)return;
    const r=b.querySelector('img').getBoundingClientRect(),x=(event.clientX-r.left)/r.width,y=(event.clientY-r.top)/r.height;
    if((v.targets||[v.target]).some(t=>((x-t[0])/.24)**2+((y-t[1])/.3)**2<=1))incursionAction('contact',0,'photo');
    else {const feedback=document.querySelector('.inc-feedback');if(feedback)feedback.textContent='そこには手応えがない。異変の付近に触れてください。';}
    return;
  }
  incursionAction(b.dataset.inc,Number(b.dataset.value));
});
document.addEventListener('change',event=>{if(event.target.matches('[data-inc="quiet"]')){incursionState(true).quiet=event.target.checked;markDirty();renderIncursion();drawIncursion();}});
// Keep Escape local to the top-layer dialog; do not close a result sheet underneath it.
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.getElementById('incursion-dialog')?.open){event.preventDefault();event.stopImmediatePropagation();closeIncursion();}},true);
