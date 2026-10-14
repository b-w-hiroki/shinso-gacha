/* Fictional next-day case notes. All unlocked prose is a pure projection of
 * actually acquired case fragments and evidence; no change to rolls or saves. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ForecastArchive=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const modes={cctv:'監視記録',photo:'写真記録',vision:'目撃記録',dash:'走行記録'};
 const notes={
  u1:{forecast:'明日の巡回票には、同じ一分間に四度目の巡回が記載されている。出口番号だけが空欄になっている。',difference:'三度分しかない監視原本と、四度目を受領済みとする明日の巡回票が一致しない。',witness:'巡回の担当者は三人。四度目の確認印だけ、立会欄の外側に押されている。'},
  u2:{forecast:'運行されていない列車の遺失物票が、明日の受領箱に届く。受取場所は第六文書課になっている。',difference:'出場だけが残る改札記録と、まだ存在しない受取時刻の遺失物票が一致しない。',witness:'受取人欄は未記入だが、引渡しを確認した職員の署名だけは既にある。'},
  u3:{forecast:'翌朝の回収票には、人形ではなく、その呼び名が返納されたと記されている。箱は封印済み。',difference:'一体を回収した写真と、二人分の影を照合した明日の保管台帳が一致しない。',witness:'物品管理に照会した。返納者は職員ではなく、物品名として登録されている。'},
  u4:{forecast:'翌日の聞き取り票には、質問を始める前の返答が四件記録されている。録音は三件しかない。',difference:'三人の証言と、四人目の相槌を受領した翌日票が一致しない。',witness:'最後の返答を書いた担当者を探したが、聞き取り室の入室記録には残っていない。'},
  u5:{forecast:'明日の内線調査では、切断された電話の着信先が調査室の机の内側と記載されている。',difference:'接続先のない通話記録と、受信機を特定した翌日の配線表が一致しない。',witness:'回線を調べた職員はいない。設備点検の完了印だけが明日の欄にある。'},
  u6:{forecast:'閉鎖校舎の翌日点検票には、図面にない三つ目の部屋の鍵が返却済みと記されている。',difference:'二室しかない図面と、三室を施錠した翌日点検票が一致しない。',witness:'鍵の返却窓口は廃止済みだった。受付者の印影だけ残されている。'},
  u7:{forecast:'明日の遠景調査では、証言から消えた単語だけを採取したと報告されている。録音媒体は空白。',difference:'互いに異なる目撃証言と、ひとつの語を回収した翌日報告が一致しない。',witness:'採取者の名前を書くと、調査対象の欄まで同じ筆跡になってしまう。'},
  u8:{forecast:'翌日の画面点検記録には、閉じられた赤い窓の内側から撮影された画像が添付されている。',difference:'通信のない端末履歴と、受信済みとされる翌日の添付画像が一致しない。',witness:'画像の送信者は確認できなかった。受信確認者の欄には二つの印がある。'},
  u9:{forecast:'翌朝の音声台帳には、録音前の呼び声を聞いた職員の署名がある。該当時刻は無人だった。',difference:'録音開始前の波形と、立会済みとする翌日の音声台帳が一致しない。',witness:'声を聞いた職員は名簿にいない。声に答えたという記録だけ保管されている。'},
  u10:{forecast:'翌日付けの踏切調査では、始点のない擦過痕の長さだけが更新され、終点は変わっていない。',difference:'同時刻の二通報と、距離が縮んだとする翌日の路面測定表が一致しない。',witness:'測定者は現場へ向かっていない。計測機器は調査室に置いたままだった。'},
  u11:{forecast:'翌日の在室票では、入室していない一人が最初に退室したことになっている。寝台下は未確認。',difference:'入室履歴のない在室者と、最初の退室者を記す翌日票が一致しない。',witness:'退室を確認した者の署名はない。室内写真の撮影者欄だけ埋まっている。'},
  u12:{forecast:'明日の時刻表には、夢でしか聞いていない駅の発車時刻が書き込まれている。乗務員欄は白紙。',difference:'就寝中の録音時刻と、起床後に運行済みと記録された翌日時刻表が一致しない。',witness:'乗務員照会をかけた者はいない。確認印は起床前に押されている。'}
 };
 function inspect(id,levels,cases,proof,layer){
  // Number(undefined) is NaN, so !(value>=3) is essential: never rely on value<3.
  const stage=levels?.[id];
  if(!Object.hasOwn(notes,id)||!Object.hasOwn(cases||{},id)||!Number.isInteger(stage)||stage<3)return null;
  const mode=cases[id].mode,kind=modes[mode];if(!kind)return null;
  const note=notes[id],hasProof=!!proof,noticed=layer?.noticed===true,compared=layer?.compared===true;
  return {
   title:'未提出の翌日報告',kind,
   forecast:note.forecast,
   comparison:!hasProof?'照合できる記録はまだ届いていない。':noticed?note.difference:'報告書と照合できる観測記録が見つかった。',
   staff:hasProof&&noticed&&compared?{label:'登録のない立会人',quote:note.witness}:null,
   warning:hasProof?'報告書の予告は現在の記録と照合できる。同じ現象だとは断定できない。':'この記録の内容が実現するとは限らない。'
  };
 }
 return {inspect};
});