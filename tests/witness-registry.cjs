const {chromium,webkit}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict');
const server=http.createServer((req,res)=>{try{const u=new URL(req.url,'http://localhost');const f=u.pathname==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),u.pathname==='/'?'index.html':u.pathname);res.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404);res.end();}});
(async()=>{
 await new Promise(done=>server.listen(0,'127.0.0.1',done));
 const b=await (process.env.QA_WEBKIT?webkit:chromium).launch(process.env.QA_WEBKIT?{}:{executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});
 try{
  const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',route=>route.abort());await p.goto('http://127.0.0.1:'+server.address().port);
  if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}body,button{font-family:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
  await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.levels={u1:3,u2:3};S.lastTick=Date.now()+600000;S.streak={last:dayKey(),n:1};S.incursion={version:1,level:0,discovered:{},history:[]};S.observation=WatchModel.create(Date.now(),42);S.legendLayers={};S.currency=5000;applyMode();go('home');render();});
  const wallet=await p.evaluate(()=>S.currency);
  await p.evaluate(()=>openEncyclopedia('people'));
  assert.equal(await p.locator('[data-catalog-entry^="ghost:"]').count(),0,'no classified person before comparison');
  assert.equal(await p.locator('[data-witness-registry]').count(),0,'no link to unknown person');
  assert.equal(await p.evaluate(()=>!!S.communications?.mail?.['unregistered-personnel']),false);
  await p.evaluate(()=>{S.legendLayers={noticed:{u1:true},compared:{u1:true}};openEncyclopedia('people');renderMenuBadge();});
  const entry=p.locator('[data-catalog-entry="ghost:registry"]');
  assert(await entry.isVisible());assert.equal(await p.locator('[data-catalog-entry^="ghost:"]').count(),1,'one profile for many cases');
  assert(!(await p.locator('.catalog').innerText()).includes('きさらぎ駅'),'not acquired report title is absent');
  await entry.click();
  assert(await p.locator('.witness-dossier').isVisible());
  assert(await p.locator('.witness-photo').isVisible(),'deliberately missing portrait renders without a broken image');
  assert.equal(await p.locator('.witness-dossier img').count(),0);
  assert((await p.locator('.witness-dossier').innerText()).includes('巡回票'));
  assert(!(await p.locator('.witness-dossier').innerText()).includes('列車に乗っていない'));
  assert.equal(await p.locator('[data-witness-case]').count(),0,'other case remains hidden');
  for(const [width,height] of [[320,568],[390,844],[844,390]]){
    await p.setViewportSize({width,height});
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow');
    await p.locator('.witness-dossier .btn-paper').scrollIntoViewIfNeeded();
    assert(await p.locator('.witness-dossier .btn-paper').evaluate(e=>e.getBoundingClientRect().height>=44));
    if(width===390&&!process.env.QA_WEBKIT){
      await p.screenshot({path:'docs/qa-incursions/witness-registry-detail-390.jpg',quality:85});
      await p.locator('.witness-photo').scrollIntoViewIfNeeded();
      await p.screenshot({path:'docs/qa-incursions/witness-registry-390.jpg',quality:85});
    }
  }
  await p.evaluate(()=>{
   S.legendLayers.noticed.u2=true;S.legendLayers.compared.u2=true;
   const old=new Date();old.setDate(old.getDate()-2);
   const issued=ForecastFollowup.issue(null,'u2','dash',old.getTime());
   S.forecastFollowups=ForecastFollowup.collect(issued.state,{mode:'dash',rarity:0},Date.now()).state;
   openEncyclopedia('people');renderMenuBadge();
  });
  assert.equal(await p.locator('[data-catalog-entry^="ghost:"]').count(),1);
  assert((await entry.innerText()).includes('2件'));
  await entry.click();
  assert.equal(await p.locator('[data-witness-case]').count(),1);
  await p.locator('.witness-related summary').click();
  await p.locator('[data-witness-case="u2"]').click();
  assert((await p.locator('.witness-record').innerText()).includes('列車に乗っていない'));
  assert((await p.locator('.witness-forecast').innerText()).includes('平常'));
  assert.equal(await p.evaluate(()=>S.currency),wallet);
  await p.evaluate(()=>{hideSheet();openGameInbox();});
  assert.equal(await p.locator('[data-mail="unregistered-personnel"]').count(),1,'one registered mail');
  await p.locator('[data-mail="unregistered-personnel"]').click();
  await p.locator('[data-witness-registry]').click();
  assert(await p.locator('.witness-dossier').isVisible(),'mail links to dedicated person');
  await p.evaluate(()=>save());await p.reload();
  await p.evaluate(()=>openEncyclopedia('people'));
  assert.equal(await p.locator('[data-catalog-entry^="ghost:"]').count(),1);
  assert.equal(await p.evaluate(()=>S.communications.mail['unregistered-personnel'].read),true);
  assert.equal(await p.evaluate(()=>S.currency),wallet);
  assert.deepEqual(errors,[]);
  console.log('Unregistered witness: hidden-to-earned, consolidated records, later forecast, inbox, save and responsive profile passed');
 }finally{await b.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
