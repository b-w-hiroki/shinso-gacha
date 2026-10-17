/* Read-only projection of structural contradictions from existing observation progress. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LabContradictionModel=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const stages=Object.freeze([
  Object.freeze({threshold:3,label:'現行図',title:'内寸不一致',body:'東壁の計測値は6.2m、西壁側から測ると7.0m。同じ柱間を記録している。'}),
  Object.freeze({threshold:10,label:'配線図',title:'重複区画',body:'観測盤の背面に、調査室と同じ管理番号の部屋が一室分重なっている。'}),
  Object.freeze({threshold:20,label:'入退室',title:'退出先不一致',body:'北扉の退出先は調査室。扉を通った記録はあるが、廊下の通過記録はない。'})
 ]);
 function project(input){
  const value=input&&typeof input==='object'&&!Array.isArray(input)?Number(input.collected):0;
  const collected=Number.isFinite(value)&&value>0?Math.floor(value):0;
  const rows=stages.filter(stage=>collected>=stage.threshold).map(({label,title,body})=>({label,title,body}));
  return rows.length?{title:'調査室構造照合',status:'要確認',rows}:null;
 }
 return {STAGES:stages,project};
});
