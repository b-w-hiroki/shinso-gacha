/* A read-only fiction layer: it observes one real choice but never performs it. */
let actionForecastView={key:'',prediction:null,result:null,expiresAt:0},actionForecastTimer=null;
function actionForecastNode(){
 let node=document.getElementById('action-forecast');
 if(node)return node;
 node=document.createElement('aside');node.id='action-forecast';node.className='action-forecast';node.setAttribute('role','status');node.setAttribute('aria-live','polite');node.hidden=true;
 node.innerHTML='<small>先行入力記録</small><b></b><span></span>';
 document.getElementById('obs-atmosphere')?.after(node);return node;
}
function actionForecastProjection(){
 if(typeof S==='undefined'||typeof ActionForecastModel==='undefined'||typeof playerSeepageState!=='function'||typeof observationState!=='function')return null;
 const frame=document.getElementById('obs-frame'),o=observationState(),event=playerSeepageState().event;
 const modal=!!document.querySelector('dialog[open]')||!document.getElementById('sheet-bg').hidden||!document.getElementById('stage').hidden;
 return ActionForecastModel.project(event,{now:Date.now(),visible:!document.hidden&&!!frame?.getClientRects().length,quiet:isLite()||o.quiet||!!S.incursion?.quiet,monitorOpen:!o.mind.closed,modal});
}
function renderActionForecast(){
 const node=actionForecastNode(),prediction=actionForecastProjection(),now=Date.now();
 if(!prediction){node.hidden=true;return;}
 if(actionForecastView.key!==prediction.key)actionForecastView={key:prediction.key,prediction,result:null,expiresAt:0};
 if(actionForecastView.result&&now>=actionForecastView.expiresAt){node.hidden=true;return;}
 node.hidden=false;node.dataset.phase=actionForecastView.result?'settled':'pending';
 const title=node.querySelector('b'),detail=node.querySelector('span');
 if(!actionForecastView.result){title.textContent=`次の操作：${prediction.label}`;detail.textContent='この記録は、入力より先に作成されています。';return;}
 const result=actionForecastView.result;
 title.textContent=result.matched?`照合結果：一致（${prediction.label}）`:'照合結果：不一致';
 detail.textContent=result.matched?'操作時刻だけが、記録より遅れています。':`予定 ${prediction.label} ／ 実行 ${result.actualLabel}`;
}
function actionForecastActual(target){
 if(target.closest('#obs-frame'))return 'observe';
 if(target.closest('#obs-rest'))return 'rest';
 if(target.closest('#obs-colleagues'))return 'colleagues';
 return '';
}
document.addEventListener('click',event=>{
 const actual=actionForecastActual(event.target);if(!actual||event.target.closest('button:disabled'))return;
 const prediction=actionForecastProjection();if(!prediction||prediction.key!==actionForecastView.key||actionForecastView.result)return;
 const result=ActionForecastModel.settle(prediction,actual);if(!result)return;
 actionForecastView.result=result;actionForecastView.expiresAt=Date.now()+4500;
 clearTimeout(actionForecastTimer);actionForecastTimer=setTimeout(renderActionForecast,4550);renderActionForecast();
},true);
const actionForecastBaseRender=typeof renderPlayerSeepage==='function'?renderPlayerSeepage:null;
if(actionForecastBaseRender)renderPlayerSeepage=function(){const value=actionForecastBaseRender.apply(this,arguments);renderActionForecast();return value;};
if(typeof S!=='undefined')renderActionForecast();
