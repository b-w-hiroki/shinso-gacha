/* The reverse of an actually recovered classroom photograph is another clue.
 * Nothing is visible until its exact rarity has been collected. No new save. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PhotoVerso=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const NOTES=[
  {title:'原本の受領票',stamp:'原本・平常',lead:'撮影者欄は未記入。教室の施錠時刻だけが残っている。',trace:'この頁だけには訂正印がない。'},
  {title:'座席配置の修正票',stamp:'追加確認',lead:'席の位置に細い朱線がある。備品番号の欄には、位置を移した理由が書かれていない。',trace:'配置図と回収した写真を見比べても、訂正した席が特定できない。'},
  {title:'在室者欄の照会',stamp:'照合保留',lead:'黒板側に立つ人物の欄だけが空欄になっている。人数の合計は元のまま。',trace:'目撃者は一人増えたとは答えていない。記録の人数だけが合わない。'},
  {title:'出席番号の追補',stamp:'原本差異',lead:'出席番号の重複を示す付箋がある。削除された番号の記録は残っていない。',trace:'変更前の台帳より、後で撮影された写真のほうが古い形式になっている。'}
 ];
 function inspect(mode,rarity,entry){
  if(mode!=='photo'||![0,1,2,3].includes(rarity)||!entry||typeof entry!=='object')return null;
  const amount=entry.rarities?.[rarity];
  if(!Number.isSafeInteger(amount)||amount<1)return null;
  return {rarity,...NOTES[rarity]};
 }
 return {inspect};
});