/* Acquired-only projections of an unregistered colleague. No real personal identifiers. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.WitnessRegistry=api;
})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const notes={
  u1:'巡回票の立会欄は三段ある。記入された署名の数は、四つ。',
  u2:'列車に乗っていない職員が、降車確認の担当者になっている。',
  u3:'封印した人形の受領票に、職員名簿にはない筆跡が残る。',
  u4:'聞き取り票の空欄に、先に相槌だけが記録されている。',
  u5:'通話記録の監督者欄は空白。認証印のかすれだけが残る。',
  u6:'封鎖校舎の入構記録では、署名者が点検対象に含まれている。',
  u7:'立会人は「何も見なかった」と報告した。氏名欄が削られたのはそのあと。',
  u8:'画面を閉じた担当者の記録が、閉じた画面の内側に残っている。',
  u9:'聞き取りを録音した端末には、録音開始前の受領印が残る。',
  u10:'通報の受付記録には、まだ配属されていない職員の印がある。',
  u11:'無人と記載された部屋の施錠記録には、立会者二名と書かれている。',
  u12:'翌朝の乗務員名簿に、夢の中の駅へ立ち会った者が載っている。'
 };
 function inspect(id,levels,cases,compared,followup){
  if(!Object.hasOwn(notes,id)||!Object.hasOwn(cases||{},id)||
   !(Number(levels?.[id])>=3)||compared!==true)return null;
  const c=cases[id],v=followup?.status==='compared'?followup:null;
  return {id,record:notes[id],testimony:c.witness,statement:c.fragments[2][1],
   extra:v?(v.rarity>0?'後日、同じ方式の異変記録を回収した。立会人の印は訂正されていない。':'後日の映像は平常だった。立会人の印だけが残っている。'):null};
 }
 function list(levels,cases,compared,followups){
  return Object.keys(notes).map(id=>inspect(id,levels,cases,compared?.[id]===true,followups?.[id])).filter(Boolean);
 }
 return {inspect,list};
});
