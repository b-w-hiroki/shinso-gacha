const {chromium,webkit}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict');
const server=http.createServer((q,r)=>{try{const u=new URL(q.url,'http://localhost'),f=u.pathname==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),u.pathname==='/'?'index.html':u.pathname);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':f.endsWith('.webp')?'image/webp':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await (process.env.QA_WEBKIT?webkit:chromium).launch({headless:!process.env.QA_HEADED,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:process.env.QA_WEBKIT?[]:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});
 try{
  const p=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.route('https://**/*',route=>route.abort());
  await p.goto('http://127.0.0.1:'+server.address().port);
  if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}body,button{font-family:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
  await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.pulls=45;S.lastTick=Date.now()+600000;S.streak={last:dayKey(),n:1};S.incursion={version:1,level:0,resolved:0,history:[]};S.observation=WatchModel.create(Date.now(),42);S.currency=5000;applyMode();go('home');setHomeTab('desk');render();});
  const wallet=await p.evaluate(()=>S.currency);
  await p.locator('#obs-colleagues').click();
  const staff=['records','equipment','senior'];
  for(let i=0;i<staff.length;i++){
   const id=staff[i];await p.locator('[data-watch-member="'+id+'"]').click();
   if(i===0)assert.equal(await p.evaluate(()=>!!S.personnelEvidence),false,'first contact is not an inquiry');
   await p.locator('[data-watch-next]').click();
   await p.locator('[data-watch-talk="'+id+'"][data-topic="office"]').click();
   const line=await p.locator('.watch-conversation blockquote').innerText();
   assert(line.includes('記録')||line.includes('四人')||line.includes('四脚'),'tier-specific human contradiction is spoken');
   const snapshot=await p.evaluate(()=>PersonnelDiscrepancies.detail(S.personnelEvidence,rankIdx(),'extra-seat'));
   assert.equal(snapshot.statements.length,i+1);
   assert.equal(snapshot.confirmed,false);
   if(i===0)assert.equal(snapshot.conclusion,null,'undiscovered resolution is not included');
   if(i!==2)await p.locator('[data-watch="colleagues"]').click();
  }
  assert(await p.locator('[data-personnel-list]').isVisible(),'all three witnesses open a comparison route');
  await p.locator('[data-personnel-list]').click();
  assert(await p.locator('[data-view="menu"]').isVisible(),'catalog is a normal page');
  const record=p.locator('[data-catalog-entry="personnel:extra-seat"]');
  assert(await record.isVisible());
  await record.click();
  assert.equal(await p.locator('.catalog-detail blockquote').count(),3);
  for(const [width,height] of [[320,568],[390,844]]){
   await p.setViewportSize({width,height});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   const btn=p.locator('[data-personnel-confirm]');
   await btn.scrollIntoViewIfNeeded();assert(await btn.evaluate(e=>{const r=e.getBoundingClientRect();return r.height>=44&&r.width>100;}));
   if(width===390&&!process.env.QA_WEBKIT){await p.screenshot({path:'docs/qa-incursions/personnel-contradiction-390.jpg',quality:85});}
  }
  await p.locator('[data-personnel-confirm="extra-seat"]').click();
  assert(await p.locator('.catalog-detail').innerText().then(s=>s.includes('三人とも答えなかった')));
  assert.equal(await p.locator('[data-personnel-confirm]').count(),0,'cannot award a comparison twice');
  const summary=await p.evaluate(()=>({confirmed:S.personnelEvidence.confirmed['extra-seat'],mail:!!S.communications.mail['personnel-extra-seat'],currency:S.currency}));
  assert.deepEqual(summary,{confirmed:true,mail:true,currency:wallet},'compare sends one letter without points');
  await p.evaluate(()=>{S.pulls=190;S.lastTick=Date.now()+600000;markDirty();save();});
  assert.equal(await p.evaluate(()=>PersonnelDiscrepancies.current(rankIdx()).id),'return-log');
  assert.equal(await p.evaluate(()=>PersonnelDiscrepancies.detail(S.personnelEvidence,rankIdx(),'extra-seat').confirmed),true);
  await p.reload();assert.equal(await p.evaluate(()=>S.personnelEvidence.confirmed['extra-seat']),true,'the filed contradiction persists');
  assert.equal(await p.evaluate(()=>Object.keys(S.communications.mail).filter(k=>k==='personnel-extra-seat').length),1);
  assert.deepEqual(errors,[]);
  console.log('Personnel contradictions: office testimony, progressive access, first-contact protection, catalog comparison, 320/390 readability, saved mail and reload passed');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
