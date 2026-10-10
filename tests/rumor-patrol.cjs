const {chromium,webkit}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const server=http.createServer((q,r)=>{try{const f=q.url==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),q.url==='/'?'index.html':q.url);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await (process.env.QA_WEBKIT?webkit:chromium).launch(process.env.QA_WEBKIT?{}:{executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});try{
 const p=await b.newPage({viewport:{width:390,height:680},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);
 async function loadFont(){if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}}await loadFont();
 await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+600000;S.incursion={version:1,level:0,resolved:0,history:[]};S.streak={last:dayKey(),n:1};S.observation=WatchModel.create(Date.now(),42);S.currency=5000;applyMode();go('home');setHomeTab('desk');render();});

 await p.clock.install();await p.clock.pauseAt(new Date(Date.now()+1000));
 // Actual saved v2 state upgrades/refunds once and retains the in-flight observation.
 await p.evaluate(()=>{const o=WatchModel.create(Date.now(),42);o.version=2;o.unlocked=['cctv','photo','dash'];o.upgrades={retention:1,interval:1,sensitivity:1,patrol:1,suppression:1};o.pending={mode:'cctv',rarity:1,readyAt:Date.now(),expiresAt:Date.now()+3600000,sequence:0,suppression:3,strain:2};S.observation=o;S.currency=100;save();});
 await p.reload();await loadFont();assert.equal(await p.evaluate(()=>S.currency),1000);assert.equal(await p.evaluate(()=>S.observation.version),3);assert.equal(await p.evaluate(()=>S.observation.upgrades.sensitivity),6);assert.equal(await p.evaluate(()=>S.observation.pending.suppression),3);
 await p.reload();await loadFont();assert.equal(await p.evaluate(()=>S.currency),1000,'no repeated refund');
 await p.evaluate(()=>{go('lab');render();});assert((await p.locator('.watch-lab').innerText()).includes('900ptを返還済み'));assert.equal(await p.locator('[data-watch-unlock]').count(),0);
 await p.locator('.watch-upgrades summary').click();assert((await p.locator('.watch-upgrades').innerText()).includes('異変 8% → 異変 8.5%'));
 await p.locator('[data-watch-upgrade="sensitivity"]').click();assert.equal(await p.evaluate(()=>S.currency),950);assert.equal(await p.evaluate(()=>S.observation.upgrades.sensitivity),7);
 await p.screenshot({path:'docs/qa-incursions/patrol-growth-390.jpg'});
 // Same viewport: the frame and control row never move when source/status changes.
 for(const [width,height] of [[320,568],[390,844],[844,390]]){
  await p.setViewportSize({width,height});let baseline;
  for(const mode of ['cctv','photo','vision','dash'])for(const state of ['normal','anomaly','closed','feedback']){
   await p.evaluate(({mode,state})=>{go('home');setHomeTab('desk');const o=observationState(),t=Date.now();o.mode=mode;o.mind.closed=state==='closed';o.pending=state==='anomaly'?{mode,rarity:2,readyAt:t,expiresAt:t+3600000,sequence:0,suppression:0}:null;watchMessage=state==='feedback'?'記録を受信しました。次の観測地点へ回線を切り替えています。':'';watchMessageUntil=t+50000;renderObservation();scrollTo(0,0);}, {mode,state});await p.clock.runFor(80);
   const g=await p.evaluate(()=>{const f=document.getElementById('obs-frame').getBoundingClientRect(),im=document.getElementById('obs-image').getBoundingClientRect(),c=document.querySelector('.obs-secondary').getBoundingClientRect();return {x:f.x,y:f.y,w:f.width,h:f.height,controls:c.y,contained:im.x>=f.x-1&&im.y>=f.y-1&&im.right<=f.right+1&&im.bottom<=f.bottom+1,overflow:document.documentElement.scrollWidth>innerWidth};});
   assert(g.contained);assert(!g.overflow);const values=[g.x,g.y,g.w,g.h,g.controls];if(!baseline)baseline=values;else values.forEach((v,i)=>assert(Math.abs(v-baseline[i])<=1,JSON.stringify({mode,state,g,baseline})));
   if(width===390&&state==='normal'&&['cctv','photo'].includes(mode))await p.screenshot({path:`docs/qa-incursions/fixed-monitor-${mode}-390.jpg`});
  }
 }
 // Four normal patrols produce a clue without pretending it is acquired evidence.
 await p.setViewportSize({width:390,height:844});await p.evaluate(()=>{S.observation=WatchModel.create(Date.now(),17);S.levels.u2=3;S.legends={active:'u2'};go('home');setHomeTab('desk');for(let i=0;i<4;i++){const o=observationState();o.pending=null;o.tapProgress=9;WatchModel.tap(o,Date.now());}watchMessage='';renderObservation();});
 assert((await p.locator('#obs-atmosphere').innerText()).includes('きさらぎ駅'));assert.equal(await p.evaluate(()=>S.observation.collected),4);
 // Resolved anomaly follows the original legend into a colleague scene; explicit rest clears it.
 await p.evaluate(()=>{const o=observationState(),t=Date.now();for(let seed=1;seed<10000;seed++){const n=SeepageModel.hash(`watch:${seed}:0:dash`,seed);if(n%100<35&&Math.floor(n/100)%9===7){o.seed=seed;break;}}o.mode='dash';o.pending={mode:'dash',rarity:2,legendId:'u2',readyAt:t,expiresAt:t+3600000,sequence:0,suppression:9};o.mind.closed=false;o.quiet=true;S.playerSeepage={};renderObservation();});
 await p.locator('#obs-frame').press('Enter');await p.locator('[data-watch-region="4"]').click();assert.equal(await p.evaluate(()=>S.observation.echo.legendId),'u2');
 await p.evaluate(()=>{observationState().quiet=false;});await p.locator('#obs-colleagues').click();await p.locator('[data-watch-member="equipment"]').click();assert((await p.locator('.seep-colleague-line').innerText()).includes('降りる場所'));assert.equal(await p.evaluate(()=>S.playerSeepage.event.legendId),'u2');
 await p.locator('[data-watch-next="equipment"]').click();await p.locator('[data-topic="rest"]').click();assert.equal(await p.evaluate(()=>S.observation.echo),null);assert.equal(await p.evaluate(()=>S.playerSeepage.event),null);
 assert.deepEqual(errors,[]);console.log('Real v2 migration/refund, incremental purchase, fixed monitor across modes/states/sizes, quiet clues and post-encounter colleague echo passed');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
