const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const server=http.createServer((q,r)=>{try{const f=q.url==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),q.url==='/'?'index.html':q.url);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});try{
 const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);
 if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
 await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+600000;S.incursion={version:1,level:0,resolved:0,history:[]};S.streak={last:dayKey(),n:1};S.observation=WatchModel.create(Date.now(),42);S.currency=5000;applyMode();go('home');setHomeTab('desk');render();});
 assert(await p.locator('[data-watch="settings"]').isHidden(),'settings locked before training');
 await p.locator('#game-menu').click();await p.locator('[data-menu="settings"]').click();assert(await p.locator('[data-watch-quiet]').isVisible(),'motion preference is always available');assert.equal(await p.locator('[data-menu="observation"]').count(),0);await p.keyboard.press('Escape');
 await p.evaluate(()=>go('lab'));await p.locator('.watch-upgrades summary').click();await p.locator('[data-watch-upgrade="retention"]').click();await p.evaluate(()=>{go('home');render();});assert(await p.locator('[data-watch="settings"]').isVisible(),'training unlocks settings');
 await p.clock.install();await p.clock.pauseAt(new Date(Date.now()+1000));
 // Every clue can be touched at its native-image coordinate, including portrait edges in landscape.
 for(const [width,height] of [[320,568],[390,844],[844,390]]){
  await p.setViewportSize({width,height});
  for(const mode of ['cctv','photo','vision','dash'])for(const rarity of [1,2,3]){
   await p.evaluate(({mode,rarity})=>{const o=observationState(),t=Date.now();o.unlocked=Object.keys(WatchModel.MODES);o.mode=mode;o.mind.closed=false;o.pending={mode,rarity,readyAt:t,expiresAt:t+3600000,sequence:o.sequence,suppression:0,strain:0};renderObservation();}, {mode,rarity});
   await p.clock.runFor(40);
   const frame=p.locator('#obs-frame');await frame.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
   const point=await p.locator('#obs-image').evaluate(e=>{const r=e.getBoundingClientRect(),f=document.getElementById('obs-frame').getBoundingClientRect(),[x,y]=WatchModel.TARGETS[S.observation.mode][S.observation.pending.rarity][0];return {x:r.left+r.width*x,y:r.top+r.height*y,inside:r.left>=f.left-.1&&r.right<=f.right+.1&&r.top>=f.top-.1&&r.bottom<=f.bottom+.1};});
   assert(point.inside,'full clue image remains in the frame '+mode+' '+width);
   const shifted=await p.evaluate(point=>{const previous=scrollY;scrollBy(0,point.y-innerHeight/2);return previous-scrollY;},point);
   await p.mouse.click(point.x,point.y+shifted);assert.equal(await p.evaluate(()=>S.observation.pending.suppression),1,mode+' '+rarity+' '+width);
   await p.locator('#obs-frame').press('Enter');assert.equal(await p.evaluate(()=>S.observation.pending.suppression),1,'ordinary button opens a choice, does not hit');
   await p.keyboard.press('Escape');
  }
  await p.evaluate(()=>{scrollTo(0,0);document.activeElement?.blur();});await p.clock.runFor(80);
  await p.screenshot({path:`docs/qa-incursions/firstview-${width}.jpg`,quality:85});
  for(const control of await p.locator('.obs-secondary button:visible').all()){if(width>height)await control.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));assert(await control.evaluate(e=>{const r=e.getBoundingClientRect(),nav=document.querySelector('.nav-in').getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return r.height>=44&&r.bottom<=nav.top&&r.top>=0&&(e===hit||e.contains(hit));}),'reachable controls '+width);}
  await p.screenshot({path:`docs/qa-incursions/firstview-${width}.jpg`,quality:85});
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 await p.setViewportSize({width:390,height:844});
 await p.evaluate(()=>{const o=observationState(),t=Date.now();o.mode='photo';o.pending={mode:'photo',rarity:3,readyAt:t,expiresAt:t+3600000,sequence:o.sequence,suppression:0,strain:0};o.mind.load=0;o.mind.lastAt=t;o.mind.lastInput=t;renderObservation();scrollTo(0,0);});
 await p.clock.runFor(80);
 await p.locator('#obs-frame').click({position:{x:5,y:50}});assert.equal(await p.evaluate(()=>S.observation.pending.suppression),0,'off-image tap misses');
 // Deterministic sustained pursuit: escalating at 20/45/75s without numeric HUD.
 await p.evaluate(()=>{const o=observationState(),t=Date.now();for(let i=1;i<=80;i++){if(i%10===0)WatchModel.pursue(o,t+i*1000);WatchModel.mindTick(o,t+i*1000,{viewing:true});}renderObservation();});
 assert.equal(await p.locator('body').getAttribute('data-watch-mind'),'3');
 await p.clock.runFor(1000);
 await p.emulateMedia({reducedMotion:'no-preference'});
 assert(await p.locator('#watch-veil').evaluate(e=>{const s=getComputedStyle(e);return s.opacity==='1'&&s.pointerEvents==='none';}));
 await p.locator('#obs-image').evaluate(async e=>{const im=new Image();im.src=getComputedStyle(e).backgroundImage.slice(5,-2);await im.decode();});
 await p.screenshot({path:'docs/qa-incursions/contamination-390.jpg',quality:85});
 await p.locator('#obs-rest').click();assert(await p.evaluate(()=>S.observation.mind.closed));assert(await p.locator('#obs-frame').isDisabled());assert.equal(await p.locator('#obs-tap').count(),0);assert(await p.locator('#obs-closed').isVisible());
 const old=await p.evaluate(()=>S.observation.mind.load);await p.evaluate(()=>{const o=observationState();WatchModel.mindTick(o,o.mind.lastAt+240000,{visible:false});renderObservation();save();});assert.equal(await p.evaluate(()=>S.observation.mind.load),0);assert(old>0);assert.equal(await p.locator('body').getAttribute('data-watch-mind'),'0');
 await p.screenshot({path:'docs/qa-incursions/rest-390.jpg',quality:85});
 await p.locator('#obs-colleagues').click();
 await p.locator('.watch-person img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
 assert.equal(await p.locator('.watch-person').count(),3);
 await p.clock.runFor(400);await p.screenshot({path:'docs/qa-incursions/colleague-roster-390.jpg',quality:85});
 await p.locator('[data-watch-member="records"]').click();await p.locator('[data-watch-talk="records"][data-topic="rest"]').click();assert.equal(await p.evaluate(()=>S.observation.mind.talks.records),1);assert(await p.evaluate(()=>S.observation.mind.closed));
 await p.screenshot({path:'docs/qa-incursions/colleagues-390.jpg',quality:85});
 await p.locator('[data-watch="colleagues"]').click();await p.locator('[data-watch-member="records"]').click();assert((await p.locator('.watch-conversation').innerText()).includes('この前の記録'));
 for(const [width,height] of [[320,568],[844,390]]){await p.setViewportSize({width,height});for(const el of await p.locator('.watch-dialogue-actions button').all()){await el.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));assert(await el.evaluate(e=>{const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return r.height>=44&&e.scrollWidth<=e.clientWidth&&(hit===e||e.contains(hit));}));}assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await p.locator('[data-watch-talk="records"][data-topic="strange"]').click();const first=await p.locator('.watch-conversation blockquote').innerText();
 await p.locator('[data-watch-talk="records"][data-topic="strange"]').click();assert.notEqual(await p.locator('.watch-conversation blockquote').innerText(),first);
 const count=await p.evaluate(()=>S.observation.mind.dialogue['records:strange']);
 await p.locator('[data-watch="colleagues"]').click();await p.locator('[data-watch-member="records"]').click();assert.equal(await p.evaluate(()=>S.observation.mind.dialogue['records:strange']),count,'opening does not advance dialogue');
 await p.locator('[data-watch="colleagues"]').click();await p.locator('[data-watch-member="equipment"]').click();await p.locator('[data-watch-talk="equipment"][data-topic="office"]').click();
 assert(await p.evaluate(()=>S.observation.mind.clues.absent));await p.locator('[data-watch="colleagues"]').click();await p.locator('[data-watch-member="records"]').click();await p.locator('[data-watch-talk="records"][data-topic="office"]').click();assert((await p.locator('.watch-conversation blockquote').innerText()).includes('欠勤届'));
 const talks=await p.evaluate(()=>S.observation.mind.talks.records);
 await p.keyboard.press('Escape');await p.reload();assert(await p.evaluate(()=>S.observation.mind.closed));assert.equal(await p.evaluate(()=>S.observation.mind.talks.records),talks);assert.equal(await p.evaluate(()=>S.observation.mind.dialogue['records:strange']),count);
 assert.deepEqual(errors,[]);console.log('All 12 targets at 3 sizes, missed hits, location selector, outside-screen contamination, monitor rest, conversations and persistence passed');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
