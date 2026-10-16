/* Classified personnel contradictions. Nothing is revealed without a conversation. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.PersonnelDiscrepancies=api;
})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const STAFF=['records','equipment','senior'];
 const CASES=[
  {id:'extra-seat',minRank:3,title:'余分な席',lines:{
   records:'受領印は四人分あります。でも名簿には、三人しかいません。',
   equipment:'休憩室の椅子は四脚です。設置記録では三脚になっています。',
   senior:'四人で帰った夜を覚えている。誰がもう一人いたかは、言えない。'
  },conclusion:'第六文書課の席数と職員数が一致しない。誰の席なのか、三人とも答えなかった。'},
  {id:'return-log',minRank:6,title:'帰投時刻の不一致',lines:{
   records:'帰投簿には全員の署名があります。ひとつだけ、明日の時刻です。',
   equipment:'入退室装置は昨日から電源を抜いています。なのに帰投の記録は増えています。',
   senior:'最後に帰ったのは俺だ。……そのあと、俺がもう一度戻った記録があるらしい。'
  },conclusion:'帰投した人数と入退室ログが一致しない。接続されていない機器が最後の一名を記録している。'},
  {id:'attendance',minRank:10,title:'出勤していない証言者',lines:{
   records:'その日の証言書は、私が受け取りました。でも私は休暇届を出しています。',
   equipment:'録音が始まる前に、白瀬さんの声が入っています。回線はつないでいません。',
   senior:'その日は課に誰もいないことになっている。俺たち三人が立ち会った記録もある。'
  },conclusion:'無人と記された日の証言に三人が同席している。証言者の名は保存されていない。'},
  {id:'missing-predecessor',minRank:14,title:'前任者の削除',lines:{
   records:'前任者の人事記録はありません。削除の決裁欄には、私の署名があります。',
   equipment:'前任者が使った机は今も稼働しています。廃棄届は机ではなく職員のものです。',
   senior:'前任者の顔を忘れた。でもあんたと同じ声だったことだけは覚えている。'
  },conclusion:'同一の処分番号が人員と備品の両方に付されている。担当者欄は空白になっている。'},
  {id:'observer',minRank:17,title:'観測対象になった職員',lines:{
   records:'あなたの閲覧記録を、あなたが提出する前に受領しました。',
   equipment:'そちらのモニタには何も映していません。映っているのは記録された観測者です。',
   senior:'その番号で呼ばれていた奴を知っている。ずっと前に、ここを出たはずだ。'
  },conclusion:'調査員番号が対象者番号として登録されている。記録作成者と被写体の区別はできない。'}
 ];
 const obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 function normalize(raw){
  const state={version:1,statements:{},confirmed:{}};
  if(!obj(raw))return state;
  for(const c of CASES){
   const input=obj(raw.statements?.[c.id])?raw.statements[c.id]:{};
   const known={};
   for(const id of STAFF)if(input[id]===true)known[id]=true;
   if(Object.keys(known).length)state.statements[c.id]=known;
   if(raw.confirmed?.[c.id]===true&&STAFF.every(id=>known[id]))state.confirmed[c.id]=true;
  }
  return state;
 }
 function current(rankIndex){
  const rank=Number.isFinite(Number(rankIndex))?Math.min(19,Math.max(0,Math.floor(Number(rankIndex)))):0;
  return CASES.filter(c=>rank>=c.minRank).at(-1)||null;
 }
 function record(raw,rankIndex,staffId){
  const state=normalize(raw),latest=current(rankIndex);
  if(!latest||!STAFF.includes(staffId))return {state,fresh:false,caseId:null,line:''};
  // Rank advances must not permanently lock earlier personnel cases.
  // Prefer the newest available case, then unfinished older cases for this staff member.
  const c=CASES.filter(x=>x.minRank<=Math.max(0,Math.floor(Number(rankIndex)||0)))
   .reverse().find(x=>!state.statements[x.id]?.[staffId]);
  if(!c)return {state,fresh:false,caseId:latest.id,line:''};
  state.statements[c.id]={...(state.statements[c.id]||{}),[staffId]:true};
  return {state,fresh:true,caseId:c.id,line:c.lines[staffId]};
 }
 function unlocked(raw,rankIndex){
  const state=normalize(raw),rank=Number.isFinite(Number(rankIndex))?Math.max(0,Math.floor(Number(rankIndex))):0;
  return CASES.filter(c=>rank>=c.minRank&&STAFF.some(id=>state.statements[c.id]?.[id]));
 }
 function detail(raw,rankIndex,caseId){
  const c=unlocked(raw,rankIndex).find(x=>x.id===caseId);
  if(!c)return null;
  const state=normalize(raw),statements=STAFF.filter(id=>state.statements[c.id]?.[id]).map(id=>({id,text:c.lines[id]}));
  return {id:c.id,title:c.title,statements,complete:statements.length===STAFF.length,confirmed:state.confirmed[c.id]===true,conclusion:state.confirmed[c.id]===true?c.conclusion:null};
 }
 function confirm(raw,rankIndex,caseId){
  const state=normalize(raw),record=detail(state,rankIndex,caseId);
  if(!record?.complete||record.confirmed)return {state,changed:false};
  state.confirmed[caseId]=true;
  return {state,changed:true};
 }
 return {STAFF,CASES,normalize,current,record,unlocked,detail,confirm};
});
