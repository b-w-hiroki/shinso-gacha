const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const server=http.createServer((q,r)=>{try{const f=q.url==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),q.url==='/'?'index.html':q.url);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});try{
 const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);
 if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
 await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+600000;S.incursion={version:1,level:0,resolved:0,history:[]};S.streak={last:dayKey(),n:1};S.observation=WatchModel.create(Date.now(),42);S.currency=5000;applyMode();go('home');setHomeTab('desk');render();});

 // First contact explains identity, persists independently from recovery, and never pays points.
 await p.locator('#obs-colleagues').click();
 assert(await p.locator('[data-view="colleagues"]').isVisible());assert(await p.locator('#sheet-bg').isHidden());
 assert.equal(await p.locator('.watch-person').count(),3);
 assert.equal(await p.locator('.watch-person-description').count(),3);
 const currency=await p.evaluate(()=>S.currency);
 for(const [id,name] of [['records','白瀬'],['equipment','榊'],['senior','三輪']]){
  await p.locator(`[data-watch-member="${id}"]`).click();
  assert((await p.locator('.watch-speaker').innerText()).includes('初対面'));
  assert((await p.locator('.watch-conversation blockquote').innerText()).includes(name));
  assert.equal(await p.locator('[data-watch-talk]').count(),0);
  assert.equal(await p.evaluate(id=>S.observation.mind.talks[id]||0,id),0);
  assert(await p.evaluate(id=>S.observation.contacts[id],id));
  if(id==='records')await p.screenshot({path:'docs/qa-incursions/conversation-introduction-390.jpg',quality:85});
  await p.locator('[data-watch-next]').click();assert.equal(await p.locator('[data-watch-talk]').count(),4);
  await p.locator('[data-watch="colleagues"]').click();
 }
 assert.equal(await p.evaluate(()=>S.currency),currency);
 await p.locator('[data-watch-member="records"]').click();assert(!(await p.locator('.watch-speaker').innerText()).includes('初対面'));
 await p.locator('[data-watch-talk="records"][data-topic="strange"]').click();
 assert.equal(await p.locator('[data-watch-talk]').count(),0,'reply has no topic button clutter');
 const reply=await p.locator('blockquote').innerText(),talks=await p.evaluate(()=>S.observation.mind.talks.records);
 assert((await p.locator('.watch-selected-topic').innerText()).includes('見たもの'));
 await p.locator('[data-watch-next]').click();assert.equal(await p.locator('blockquote').innerText(),reply);
 assert.equal(await p.evaluate(()=>S.observation.mind.talks.records),talks,'choosing does not trigger recovery');
 for(const [width,height] of [[320,568],[390,680],[844,390]]){
  await p.setViewportSize({width,height});
  for(const button of await p.locator('[data-view="colleagues"] button').all()){
   await button.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));assert(await button.evaluate(e=>{const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return r.height>=44&&e.scrollWidth<=e.clientWidth&&(hit===e||e.contains(hit));}));
  }
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await p.locator('[data-watch-talk="records"][data-topic="rest"]').click();
  if(width===390)await p.screenshot({path:'docs/qa-incursions/conversation-reply-390.jpg',quality:85});
  await p.locator('[data-watch-next]').click();
 }
 await p.locator('[data-watch="leave"]').click();assert(await p.locator('[data-view="home"]').isVisible());assert(await p.evaluate(()=>S.observation.mind.closed));
 await p.reload();assert.deepEqual(await p.evaluate(()=>S.observation.contacts),{records:true,equipment:true,senior:true});
 await p.locator('#obs-colleagues').click();await p.locator('[data-watch-member="records"]').click();
 // Escape dismisses the modal only, then steps back through the conversation page.
 await p.evaluate(()=>sheet('確認','<p>資料の確認</p>'));await p.keyboard.press('Escape');
 assert(await p.locator('.watch-conversation').isVisible());assert(await p.locator('#sheet-bg').isHidden());
 await p.keyboard.press('Escape');assert(await p.locator('.watch-colleagues').isVisible());
 await p.keyboard.press('Escape');assert(await p.locator('[data-view="home"]').isVisible());
 // Record-first contact introduces the speaker without losing the testimony or return route.
 await p.evaluate(()=>{S.observation.contacts={};S.observation.collection['cctv:1']=1;showWatchRecord('cctv',1);});
 await p.locator('[data-trail="witness"]').click();assert((await p.locator('.watch-introduction').innerText()).includes('白瀬です'));
 assert((await p.locator('blockquote').innerText()).includes('点検票'));
 await p.locator('[data-trail="record"]').click();assert(await p.locator('.investigation-discrepancy').isVisible());
 assert.deepEqual(errors,[]);console.log('Conversation introductions, saved contacts, separate choice/reply states, responsive controls, modal/Escape navigation and record-first testimony passed');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
