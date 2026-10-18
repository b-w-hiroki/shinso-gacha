const {chromium,webkit}=require('playwright'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const measure=process.argv.includes('--measure');
const server=http.createServer((req,res)=>{try{const u=new URL(req.url,'http://localhost'),f=u.pathname==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),u.pathname==='/'?'index.html':u.pathname);res.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':f.endsWith('.svg')?'image/svg+xml':'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404);res.end();}});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await (process.env.QA_WEBKIT?webkit:chromium).launch(process.env.QA_WEBKIT?{}:{args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const p=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[],rows=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);
  if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
  await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+600000;S.streak={last:dayKey(),n:1};S.currency=5000;S.levels.u1=2;S.observation=WatchModel.create(Date.now(),42);S.incursion={version:1,level:0,resolved:0,history:[]};applyMode();render();});
  const progress=()=>p.evaluate(()=>JSON.stringify({currency:S.currency,levels:S.levels,collection:S.observation.collection}));const before=await progress();
  for(const [width,height] of [[320,568],[390,680],[390,844],[430,932],[844,390],[1280,900]]){
   await p.setViewportSize({width,height});
   for(const view of ['home','gacha','archive','lab','report','menu']){
    await p.evaluate(v=>{if(v==='menu')openGameMenu();else go(v);scrollTo(0,0);},view);await p.waitForTimeout(70);
    const m=await p.evaluate(v=>{
     const scene=document.querySelector(`[data-view="${v}"]`),rect=e=>{const r=e?.getBoundingClientRect();return r?{top:r.top,bottom:r.bottom,height:r.height,width:r.width}:null;},tabs=scene.querySelector('.section-tabs,.home-tabs,.seg'),heading=scene.querySelector('.scene-heading,.menu-page-heading');
     return {view:v,viewport:[innerWidth,innerHeight],header:rect(heading),tabs:rect(tabs),main:rect(document.querySelector('main')),content:rect(scene.querySelector('.section-pane:not([hidden]),.home-pane:not([hidden]),#menu-page-content')),overflow:document.documentElement.scrollWidth-innerWidth,buttons:[...(tabs?.querySelectorAll('button')||[])].map(e=>({...rect(e),text:e.textContent,clipped:e.scrollWidth>e.clientWidth+1}))};
    },view);rows.push(m);
    if(measure)continue;
    assert(m.overflow<=0,JSON.stringify(m));if(m.header)assert(m.header.height<=60,JSON.stringify(m));if(m.tabs){assert(m.tabs.top<=m.main.top+24,JSON.stringify(m));assert(m.buttons.every(b=>b.height>=44&&b.width>=44&&!b.clipped),JSON.stringify(m));}
    if(m.tabs){
     const group=p.locator(`[data-view="${view}"] .section-tabs,[data-view="${view}"]>.home-tabs,[data-view="${view}"] .seg`).first(),buttons=group.locator('button'),count=await buttons.count();
     for(let i=0;i<count;i++){
      const b=buttons.nth(i);assert(await b.evaluate(e=>{const r=e.getBoundingClientRect(),t=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return e===t||e.contains(t);}),view+' tab hit area');await b.click();assert.equal(await b.getAttribute('aria-pressed'),'true');
     }
     await buttons.first().focus();await p.keyboard.press('ArrowLeft');assert.equal(await buttons.last().getAttribute('aria-pressed'),'true');assert(await buttons.last().evaluate(e=>e===document.activeElement));
     await p.keyboard.press('Home');assert.equal(await buttons.first().getAttribute('aria-pressed'),'true');await p.keyboard.press('End');assert.equal(await buttons.last().getAttribute('aria-pressed'),'true');await buttons.first().click();
     if(m.header)assert(await group.evaluate(e=>{const h=e.parentElement.querySelector('.scene-heading').getBoundingClientRect(),t=e.getBoundingClientRect();return h.right<=t.left&&h.bottom<=t.bottom+1;}),'title must not cover tabs');
    }
   }
  }
  if(!measure){
   await p.setViewportSize({width:390,height:844});await p.evaluate(()=>{go('archive');scrollTo(0,0);});
   const archive=await p.evaluate(()=>{const r=s=>document.querySelector(s).getBoundingClientRect(),secret=r('#files .folder.secret'),first=r('#files .folder:not(.secret)'),nav=r('.nav');return {secretHeight:secret.height,firstTop:first.top,navTop:nav.top,chip:[...document.querySelectorAll('.archive-scene .chips button')].map(b=>({width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height})),link:(()=>{const x=r('.archive-scene .legend-link');return {width:x.width,height:x.height}})()};});
   assert(archive.secretHeight<=125&&archive.firstTop<archive.navTop-100,'archive first dossier should not be displaced by controls '+JSON.stringify(archive));
   assert(archive.chip.every(b=>b.width>=44&&b.height>=44)&&archive.link.width>=44&&archive.link.height>=44,'archive controls need 44px targets '+JSON.stringify(archive));
   await p.locator('.archive-scene [data-chip="urban"]').click();assert.equal(await p.locator('#files .folder.secret').count(),0,'secret stays in all-files filter only');
   await p.locator('.archive-scene [data-chip="all"]').click();assert.equal(await p.locator('#files .folder.secret').count(),1);
   await p.locator('.archive-scene .legend-link').click();assert(await p.locator('.legend-case-list').isVisible(),'evidence comparison route remains available');
   await p.setViewportSize({width:320,height:568});
   for(const action of ['openGameMenu','openGameNews','openGameInbox','openMenuSettings','openEncyclopedia','openAccount']){
    await p.evaluate(name=>window[name](),action);const back=p.locator('.menu-page-heading .menu-back');assert(await back.isVisible());assert(await back.evaluate(e=>{const r=e.getBoundingClientRect(),t=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return r.height>=44&&(e===t||e.contains(t));}));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   }
   await p.evaluate(()=>openEncyclopedia());const catalog=p.locator('.catalog-tabs button');await catalog.first().focus();await p.keyboard.press('End');assert.equal(await catalog.last().getAttribute('aria-pressed'),'true');assert(await catalog.last().evaluate(e=>e===document.activeElement));await p.keyboard.press('Home');assert.equal(await catalog.first().getAttribute('aria-pressed'),'true');assert(await catalog.first().evaluate(e=>e===document.activeElement));
   for(const [width,height] of [[320,568],[390,844],[844,390]]){
    await p.setViewportSize({width,height});await p.evaluate(()=>observationColleagues());
    assert(await p.locator('.watch-colleagues h1').isVisible());assert.equal(await p.locator('.watch-person').count(),3);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    const leave=p.locator('.watch-colleagues [data-watch="leave"]');await leave.scrollIntoViewIfNeeded();await leave.click();assert(await p.locator('#obs-frame').isVisible());
   }
   // Long headings and larger text must grow naturally, without clipping/overlap.
   await p.addStyleTag({content:'.dossier-view h1,.menu-page-heading h1{font-size:40px!important}.section-tabs button,.home-tabs button,.seg button,.menu-back{font-size:28px!important}'});
   for(const view of ['archive','lab','report','menu']){
    await p.evaluate(v=>{if(v==='menu')openMenuPage('長い題名の調査記録を読む',menuBack()+'<p>本文</p>');else go(v);},view);
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'enlarged text reflow '+view);
    for(const b of await p.locator(`[data-view="${view}"] .section-tabs button,[data-view="${view}"] .menu-back`).all())assert(await b.evaluate(e=>e.scrollWidth<=e.clientWidth+1&&e.scrollHeight<=e.clientHeight+1),'enlarged control text must remain visible');
   }
   assert.equal(await progress(),before,'navigation must preserve currency, levels and collected records');
   await p.evaluate(()=>{S.role=null;S.onboarded=false;S.pulls=0;S.lite={lv:{u1:3,u2:3},pulls:6,intro:{version:1,done:true}};applyMode();});
   for(const tab of ['open','files','notes']){await p.locator(`[data-ltab="${tab}"]`).click();assert(await p.locator(`[data-lpane="${tab}"]`).isVisible());assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  }
  if(measure)console.log(JSON.stringify(rows));else console.log('Screen navigation: six viewports, all tab clicks/keyboard, six menu destinations, colleagues/civilian return, enlarged text and unchanged progress passed');assert.deepEqual(errors,[]);
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
