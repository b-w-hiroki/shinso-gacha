/* Fictional forecast dossiers: unlock only through acquired evidence. No real device identifiers. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ForecastArchive=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const modes={cctv:'監視記録',photo:'写真記録',vision:'目撃記録',dash:'走行記録'};
 const valid=id=>/^u(?:[1-9]|1[0-2])$/.test(id);
 function inspect(id,levels,cases,proof,layer){
  if(!valid(id)||!cases?.[id]||Number(levels?.[id])<3)return null;
  const mode=cases[id].mode,kind=modes[mode];if(!kind)return null;
  return {
   title:'未提出の翌日報告',kind,
   forecast:kind+'に、まだ行われていない照合の結果が記されている。',
   comparison:proof?(layer?.noticed?'報告にある人数と観測記録が一致しない。':'報告書と照合できる観測記録が見つかった。'):'照合できる記録はまだ届いていない。',
   staff:layer?.compared?{label:'登録のない立会人',quote:'立会人欄には署名がある。職員名簿には一致する者がいない。'}:null,
   warning:proof?'報告書の予告は現在の記録と照合できる。':'この記録の内容が実現するとは限らない。'
  };
 }
 return {inspect};
});