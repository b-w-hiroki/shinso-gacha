/* Fictional revision history is a pure projection of already acquired investigation state. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WorldRevisions=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const records={
  u1:['出口は三つ。巡回者は一名。','出口数を二つへ訂正。旧版にある壁の傷は現状と一致するため残置。','訂正者欄を閲覧者の職員番号へ変更。訂正時刻は次回巡回の一分後。'],
  u2:['該当者は終電で下車。駅名は路線図に存在しない。','該当者は乗車していない、と訂正。出場履歴のみ原本として保存。','遺失物の受取駅を第六文書課へ変更。旧版の駅名は未記入だったことにする。'],
  u3:['回収物は人形一体。立会者は一名。','回収物を呼び名一件へ訂正。人形の所在欄は空欄。','立会者を二名へ変更。追加された一名の署名は、現在も箱の内側にある。'],
  u4:['目撃者三名の証言を個別に受理。','質問票を未交付へ訂正。返答欄は受理済みのまま。','質問者を閲覧者へ変更。質問日時は、この履歴を開いた後に設定されている。'],
  u5:['発信地点は駅前。基地局情報は欠落。','発信地点を受話器から三メートルへ訂正。住所欄を削除。','距離の起点を閲覧者へ変更。次の着信位置は訂正のたびに一段近づく。'],
  u6:['封鎖校舎の個室は二室。点検対象外。','個室数を三室へ訂正。追加工事の記録は存在しない。','第三室を第六文書課の保管室へ変更。旧図面にも扉の開閉痕だけが残る。'],
  u7:['遠景の対象は名称不明。説明不能として保留。','対象は存在しない、と訂正。黒塗りと写真は原本のまま保存。','説明者欄を閲覧者へ変更。未入力の説明と同じ文字数だけ再び黒塗りにする。'],
  u8:['赤い窓は端末上の表示異常。外部通信なし。','窓は閉じられていた、と訂正。保存画像の赤い領域は残置。','端末の所在を閲覧者側へ変更。削除記録には次の操作位置が追記済み。'],
  u9:['夜道で犬に似た対象を目撃。録音は接触後に開始。','対象の顔を識別不能へ訂正。呼び声の記録だけ保存。','録音開始時刻を呼び声の後へ変更。波形は訂正前の秒数にも残っている。'],
  u10:['踏切の両側で同時通報。擦過痕の始点は不明。','通報地点を一か所へ統合。もう一方は誤記として削除。','次回通報者を閲覧者へ変更。削除した地点からの距離だけが短くなり続ける。'],
  u11:['在室者は一名。入室記録と一致。','在室者を二名へ訂正。追加者の入室欄は作成しない。','撮影者を閲覧者へ変更。写真の視点は寝台下から動かさない。'],
  u12:['夢の停車駅と起床時刻を参考記録として受理。','時刻表を現実の運行記録へ訂正。路線名は空欄。','終点を閲覧者の起床後へ変更。次駅名は未報告の夢から転記済み。']
 };
 const valid=id=>Object.hasOwn(records,id);
 function history(id,count,state={}){
  if(!valid(id)||!Number.isInteger(count)||count<3)return null;
  state=state&&typeof state==='object'&&!Array.isArray(state)?state:{};
  const source=records[id],rows=[{stage:'受領時',kind:'原本',text:source[0]}];
  if(state.noticed===true)rows.push({stage:'差異記録後',kind:'訂正',text:source[1]});
  if(state.noticed===true&&state.compared===true&&state.concluded===true)rows.push({stage:'照合記録後',kind:'再訂正',text:source[2]});
  return {title:'保存された修正履歴',rows};
 }
 return {history};
});
