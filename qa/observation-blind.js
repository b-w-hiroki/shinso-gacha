/* Development QA only. In-memory results, no tracker, no backend and no save. */
(function(root){
 'use strict';
 const MODES=['cctv','photo','vision','dash'],total=16;
 const get=id=>document.getElementById(id);
 const source=mode=>'../assets/observation/'+WatchLocations.byId('alt:'+mode).file;
 const file=({mode,rarity})=>{
  const photos=[source(mode)];
  if(rarity>0)photos.unshift(
   '../assets/observation/alt-overlays/'+mode+'-'+rarity+'.svg',
   '../assets/observation/photo-deltas/'+mode+'-'+rarity+'.webp'
  );
  return photos;
 };
 let cases=[],answers=[],index=-1,started=0,busy=false,loading=false,sessionCreated='';
 const elapsed=()=>Math.max(0,Math.round(performance.now()-started));
 function shuffle(rows){
  for(let i=rows.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[rows[i],rows[j]]=[rows[j],rows[i]];}
  return rows;
 }
 function expected(c,response,point){
  if(response==='skip')return 'skip';
  if(c.rarity===0)return response==='none'?'correct-normal':'false-positive';
  if(response==='none')return 'missed';
  const areas=WatchLocations.targets(c.mode,c.rarity)||[];
  const inside=areas.some(([x,y,rx,ry])=>((point.x-x)/rx)**2+((point.y-y)/ry)**2<=1);
  return inside?'hit':'false-positive';
 }
 function record(response,point=null){
  if(index<0||index>=cases.length||busy)return;
  const c=cases[index];
  const elapsedMs=elapsed(),result=expected(c,response,point);
  answers.push({order:index+1,mode:c.mode,rarity:c.rarity,
   response,point:point&&{x:Number(point.x.toFixed(5)),y:Number(point.y.toFixed(5))},
   result,elapsedMs});
  index++;
  void show();
 }
 async function loadImage(url){
  const image=new Image();image.src=url;
  await image.decode();
  if(!image.naturalWidth||!image.naturalHeight)throw Error('画像を読み込めません');
  return image;
 }
 async function show(){
  busy=true;get('test').hidden=true;
  if(index>=cases.length){finish();return;}
  const c=cases[index],images=file(c);
  try{await Promise.all(images.map(loadImage));}
  catch{
   // If a file fails, do not record an invalid human trial or fake a result.
   get('intro').hidden=false;
   get('begin').disabled=false;
   get('begin').textContent='画像が読めません。再試行する';
   index=-1;answers=[];busy=false;return;
  }
  get('scene').style.backgroundImage=images.map(path=>'url("'+path+'")').join(',');
  get('trial-index').textContent='観測 '+(index+1)+' / '+total;
  get('trial-note').textContent='違和感を見つけたら、その位置に触れてください。';
  get('test').hidden=false;
  started=performance.now();
  busy=false;
 }
 async function begin(){
  if(loading)return;
  loading=true;
  get('begin').disabled=true;
  get('begin').textContent='画像を準備しています';
  get('result').hidden=true;
  cases=shuffle(MODES.flatMap(mode=>[0,1,2,3].map(rarity=>({mode,rarity}))));
  answers=[];index=0;sessionCreated=new Date().toISOString();
  get('intro').hidden=true;
  await show();
  loading=false;
 }
 function median(v){
  if(!v.length)return null;
  const a=[...v].sort((a,b)=>a-b),i=Math.floor(a.length/2);
  return a.length%2?a[i]:Math.round((a[i-1]+a[i])/2);
 }
 function summary(){
  const hits=answers.filter(x=>x.result==='hit');
  const falsePositive=answers.filter(x=>x.result==='false-positive');
  return {
   total:answers.length,
   hitCount:hits.length,
   falsePositiveCount:falsePositive.length,
   missedCount:answers.filter(x=>x.result==='missed').length,
   correctNormalCount:answers.filter(x=>x.result==='correct-normal').length,
   skippedCount:answers.filter(x=>x.result==='skip').length,
   medianHitMs:median(hits.map(x=>x.elapsedMs))
  };
 }
 function survey(){
  const out={};
  for(const key of ['unease','clarity','return']){
   const checked=document.querySelector('input[name="survey-'+key+'"]:checked');
   if(checked)out[key]=Number(checked.value);
  }
  return out;
 }
 function result(){
  return {schema:'shinso-observation-blind-qa-v1',createdAt:sessionCreated,
   test:{trialCount:total,width:innerWidth,height:innerHeight,
    reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches},
   summary:summary(),survey:survey(),trials:answers.map(x=>({...x}))};
 }
 function finish(){
  busy=true;get('test').hidden=true;get('result').hidden=false;
  const stats=summary();
  get('result-count').textContent=stats.total+' / '+total;
  get('result-hits').textContent=String(stats.hitCount);
  get('result-false').textContent=String(stats.falsePositiveCount);
  get('result-missed').textContent=String(stats.missedCount);
  get('result-time').textContent=stats.medianHitMs===null?'―':(stats.medianHitMs/1000).toFixed(2)+'秒';
 }
 function setupSurvey(){
  const scales={
   unease:{label:'不気味さ',low:'まったく不気味でない',high:'非常に不気味'},
   clarity:{label:'操作の分かりやすさ',low:'とても分かりにくい',high:'とても分かりやすい'},
   return:{label:'再調査意欲',low:'また調べたくない',high:'また調べたい'}
  };
  document.querySelectorAll('[data-survey]').forEach(container=>{
   const key=container.dataset.survey;
   const scale=scales[key];
   const axis=document.createElement('p'),low=document.createElement('span'),high=document.createElement('span');
   axis.className='survey-axis';axis.id='survey-'+key+'-axis';
   low.textContent='1：'+scale.low;high.textContent='5：'+scale.high;
   axis.append(low,high);container.before(axis);
   for(let n=1;n<=5;n++){
    const label=document.createElement('label'),input=document.createElement('input');
    input.type='radio';input.name='survey-'+key;input.value=String(n);
    if(n===1||n===5)input.setAttribute('aria-label',scale.label+' '+n+'：'+(n===1?scale.low:scale.high));
    label.append(input,document.createTextNode(String(n)));
    container.append(label);
   }
  });
 }
 get('frame').addEventListener('click',event=>{
  if(busy)return;
  const r=get('frame').getBoundingClientRect();
  const x=(event.clientX-r.left)/r.width,y=(event.clientY-r.top)/r.height;
  if(x<0||x>1||y<0||y>1)return;
  record('tap',{x,y});
 });
 get('none').addEventListener('click',()=>record('none'));
 get('skip').addEventListener('click',()=>record('skip'));
 get('begin').addEventListener('click',()=>void begin());
 get('restart').addEventListener('click',()=>{
  get('intro').hidden=false;get('result').hidden=true;get('begin').disabled=false;
  get('begin').textContent='再び検収を開始';answers=[];cases=[];index=-1;busy=false;
 });
 get('export').addEventListener('click',()=>{
  if(index!==total)return;
  const json=JSON.stringify(result(),null,2);
  const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
  const a=document.createElement('a');
  a.href=url;a.download='shinso-observation-blind-qa.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
 });
 setupSurvey();
 root.QAStudy={result,summary,current:()=>index>=0&&index<cases.length?{...cases[index]}:null};
})(window);
