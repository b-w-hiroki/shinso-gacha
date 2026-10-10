/* Anomalies are authored fiction; deterministic per acquired case, never alter rewards. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.RealityClues=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const details=[
  {tag:'空間の継ぎ目',plain:'建物の窓は三つ。',altered:'窓は四つある。三つ目の向こうに、同じ部屋が見える。'},
  {tag:'人物の不一致',plain:'証言者の服は暗色だった。',altered:'証言者は同じ服で写っている。ただし、袖が写真ごとに逆になっている。'},
  {tag:'記録の補完',plain:'文書の末尾は破損している。',altered:'破損箇所が補われた。補筆者の記録はない。'},
  {tag:'繰り返される背景',plain:'案内標識には地名がある。',altered:'別の場所の写真にも同じ案内標識が残っている。'}
 ];
 const valid=id=>/^u(?:[1-9]|1[0-2])$/.test(id);
 const number=id=>Number(id.slice(1));
 function clue(id,count,compared){
  if(!valid(id)||Number(count)<3)return null;
  const d=details[(number(id)-1)%details.length];
  return {tag:d.tag,original:d.plain,observed:compared?d.altered:'画像の余白に、不自然な共通部分がある。',revealed:!!compared};
 }
 return {clue};
});