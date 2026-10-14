/* Anomalies are authored fiction; deterministic per acquired case, never alter rewards. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.RealityClues=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const details=[
  {tag:'出口番号の矛盾',plain:'巡回写真には三つの出口が記録されている。',altered:'出口番号だけが違う三枚の写真で、壁の傷の位置と撮影時刻が一致する。'},
  {tag:'降りていない乗客',plain:'改札の履歴は出場だけが残っている。',altered:'入場記録のない乗客が、まだ運行されていない列車の遺失物受領者になっている。'},
  {tag:'回収された呼び名',plain:'人形の向きが一晩で変わったと書かれている。',altered:'回収票の担当者欄は人名ではなく人形の呼び名。写真の影だけが二人分ある。'},
  {tag:'質問より前の返答',plain:'三人の目撃証言は別々に記録された。',altered:'質問欄が空白のまま、三人の返答が同じ語順で先に受理されている。'},
  {tag:'近づく通信記録',plain:'基地局のない着信が繰り返されている。',altered:'通話ごとに発信地点が近づく。最後の距離は電話機からではなく記録を読む者から計測されている。'},
  {tag:'図面にない扉',plain:'封鎖校舎の図面には個室が二つある。',altered:'誰も追加していない第三の部屋に、今朝の点検印だけが残っている。'},
  {tag:'消された説明',plain:'遠景写真の輪郭は一方向に定まらない。',altered:'別々の目撃者が消した言葉は一致する。黒塗りの文字数も同じだった。'},
  {tag:'閉じた画面の内側',plain:'赤い窓を閉じた記録がある。',altered:'外部通信がない時間に、閉じた窓の内側から端末を見ている部屋が記録された。'},
  {tag:'録音開始前の声',plain:'夜道で聞いた声を録音した。',altered:'声が呼んだのは目撃者自身の名前。録音開始より前の秒数にも同じ波形が残っている。'},
  {tag:'始点のない痕跡',plain:'線路を横切る擦過痕が記録されている。',altered:'音を聞いた二地点では通報時刻が同じ。片方には痕跡の終点しかない。'},
  {tag:'在室人数の差',plain:'室内写真の寝台下だけが暗い。',altered:'入室履歴のない一名が在室者に加算されている。撮影地点は寝台の下となっている。'},
  {tag:'起床時刻の時刻表',plain:'夢に現れた駅の順序が記されている。',altered:'最後の駅の発車時刻は、乗客が夢から目覚めた時刻と同じだった。'}
 ];
 const valid=id=>/^u(?:[1-9]|1[0-2])$/.test(id);
 const number=id=>Number(id.slice(1));
 function clue(id,count,compared){
  const stage=Number(count);
  if(!valid(id)||!Number.isFinite(stage)||stage<3)return null;
  const d=details[number(id)-1];
  return {tag:d.tag,original:d.plain,observed:compared===true?d.altered:'画像の余白に、不自然な共通部分がある。',revealed:compared===true};
 }
 return {clue};
});