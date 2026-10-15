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
  const c=cases[id],v=followup?.status==='compared'&&followup.mode===c.mode&&
   [0,1,2,3].includes(followup.rarity)?followup:null;
  // Re-observations are derived only from the already compared report of this
  // acquired case and the same medium. Reading does not create saved records.
  const trail=v&&Array.isArray(v.rechecks)?v.rechecks.filter(row=>row&&
   [0,1,2,3].includes(row.rarity)&&typeof row.observed==='string'&&
   /^\\d{4}\\/\\d{1,2}\\/\\d{1,2}$/.test(row.observed)).slice(0,3).map(row=>({
    observed:row.observed,rarity:row.rarity,
    note:row.rarity===v.rarity
     ?'別の日の受領記録も同じ区分だった。立会人の署名欄は訂正されていない。'
     :row.rarity===0
      ?'再観測の映像は平常だった。最初の異変を記した受領印は消されていない。'
      :'再観測では異なる区分の異変が残った。最初の報告書は訂正されていない。'
   })): [];
  return {id,mode:c.mode,record:notes[id],testimony:c.witness,statement:c.fragments[2][1],
   extra:v?(v.rarity>0?'後日、同じ方式の異変記録を回収した。立会人の印は訂正されていない。':'後日の映像は平常だった。立会人の印だけが残っている。'):null,
   trail};
 }
 function list(levels,cases,compared,followups){
  return Object.keys(notes).map(id=>inspect(id,levels,cases,compared?.[id]===true,followups?.[id])).filter(Boolean);
 }
 /* Read-only classified overlays: nothing about a future case enters the DOM.
  * Each line needs actual owned evidence AND the current clearance rank. */
 function revisions(rankIndex,owned,currentId){
  if(!Array.isArray(owned)||!owned.some(x=>x?.id===currentId))return [];
  const rank=Number.isFinite(rankIndex)?Math.max(0,Math.min(19,Math.floor(rankIndex))):0;
  const current=owned.find(x=>x?.id===currentId),count=new Set(owned.map(x=>x?.id).filter(id=>Object.hasOwn(notes,id))).size;
  const results=[];
  if(count>=2&&rank>=6)results.push({tier:2,heading:'勤務記録の重複',
   text:'別々に回収された立会資料に、同じ形で欠けた受領印がある。印影の原本は両方とも残っている。'});
  if(count>=2&&rank>=10)results.push({tier:3,heading:'人員区分の不一致',
   text:'同一の立会印について、一方の台帳は職員、もう一方は調査対象として分類している。照会先の管理番号は空欄。'});
  if(count>=3&&rank>=14)results.push({tier:4,heading:'抹消された照会履歴',
   text:'複数の記録を再照合すると、照会処理のほうが立会記録より古い。訂正の申請者は記録されていない。'});
  if(count>=3&&rank>=17&&current?.extra)results.push({tier:5,heading:'未来の受領番号',
   text:'後日回収した観測と人事台帳を照合した。照会の受付番号だけが、観測以前に確定している。'});
  return results;
 }
 /* The same missing person is classified differently by the three files.
  * These are distinct visual versions of acquired evidence, not new people. */
 function editions(rankIndex,owned,currentId){
  if(!Array.isArray(owned)||!owned.some(x=>x?.id===currentId))return [];
  const rank=Number.isFinite(rankIndex)?Math.min(19,Math.max(0,Math.floor(rankIndex))):0;
  const selected=owned.filter(x=>x&&Object.hasOwn(notes,x.id));
  const count=new Set(selected.map(x=>x.id)).size;
  if(rank<10||count<2)return [];
  const versions=[
   {code:'人事登録・写し01',category:'在籍区分',value:'登録なし',
    note:'人事側の書類は発行済み。立会印の形だけが、回収された別案件と一致する。'},
   {code:'受領台帳・写し02',category:'立会区分',value:'課内職員',
    note:'人員側に該当者はいない。受領側では同じ印影を担当者として扱っている。'}
  ];
  if(rank>=14&&count>=3)versions.push(
   {code:'監視対象・写し03',category:'分類区分',value:'観測対象',
    note:'先の二枚と同じ受付番号が、職員ではなく観測対象の欄へ移されている。'}
  );
  if(rank>=17&&count>=3&&selected.find(x=>x.id===currentId)?.extra)versions.push(
   {code:'事後受領・写し04',category:'受領時刻',value:'観測より前',
    note:'後日の観測記録を回収した後で、最初から存在したとされる訂正欄が発見された。'}
  );
  return versions;
 }
 /* Cross-read only material already earned in both evidence collections.
  * Reading never creates a record, currency or mailbox entry. */
 const personnelEchoNotes={
  'extra-seat':'立会印の数と課の席数を並べると、どちらの原簿にも余分な一人がいる。',
  'return-log':'翌日の受領時刻は帰投簿にもある。どちらも訂正印が押されていない。',
  'attendance':'無人の日の証言と、この資料の立会欄は、異なる職員名簿を参照している。',
  'missing-predecessor':'廃棄届の番号は人事原簿と一致する。誰の資料を廃棄したかは書かれていない。',
  'observer':'対象者番号と調査員番号は同じ欄にある。原本からは主語を特定できない。'
 };
 function personnelEchoes(owned,currentId,confirmed){
  if(!Array.isArray(owned)||!owned.some(x=>x&&x.id===currentId&&Object.hasOwn(notes,x.id))||!Array.isArray(confirmed))return [];
  const seen=new Set();
  return confirmed.filter(x=>{if(!x||!Object.hasOwn(personnelEchoNotes,x.id)||x.confirmed!==true||seen.has(x.id))return false;seen.add(x.id);return true;})
   .map(x=>({id:x.id,title:x.title,note:personnelEchoNotes[x.id]}));
 }
 return {inspect,list,revisions,editions,personnelEchoes};
});
