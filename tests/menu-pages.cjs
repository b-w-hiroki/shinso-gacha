const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const server=http.createServer((q,r)=>{try{const f=q.url==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),q.url==='/'?'index.html':q.url);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});try{
 const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);
 if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
 await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+600000;S.incursion={version:1,level:0,resolved:0,history:[]};S.streak={last:dayKey(),n:1};S.observation=WatchModel.create(Date.now(),42);S.currency=5000;applyMode();go('home');setHomeTab('desk');render();});


 await p.locator('[data-htab="tasks"]').click();
 await p.locator('#game-menu').click();assert(await p.locator('[data-view="menu"]').isVisible());assert(await p.locator('#sheet-bg').isHidden());assert.equal(await p.locator('#game-menu').getAttribute('aria-current'),'page');
 await p.locator('[data-menu="inbox"]').click();await p.locator('[data-mail="welcome-1"]').click();assert((await p.locator('.menu-page-heading h1').innerText()).includes('受信メール'));
 const before=await p.evaluate(()=>S.currency);await p.locator('[data-mail-claim="welcome-1"]').click();assert.equal(await p.evaluate(()=>S.currency),before+50);assert(await p.locator('[data-mail-claim="welcome-1"]').isDisabled());
 await p.locator('.menu-page-heading [data-menu="inbox"]').click();assert(await p.locator('[data-mail="welcome-1"]').isVisible());await p.locator('.menu-page-heading [data-menu="home"]').click();
 await p.locator('[data-menu="news"]').click();await p.locator('[data-notice]').first().click();assert(await p.locator('.game-message').isVisible());await p.keyboard.press('Escape');assert(await p.locator('.game-message-list').isVisible());await p.keyboard.press('Escape');
 await p.locator('[data-menu="settings"]').click();await p.locator('[data-watch-quiet]').check();assert(await p.evaluate(()=>S.observation.quiet));await p.keyboard.press('Escape');await p.locator('.menu-page-heading [data-menu="return"]').click();assert(await p.locator('[data-hpane="tasks"]').isVisible(),'return to original task pane');
 for(const [width,height] of [[320,568],[390,680],[844,390]]){
  await p.setViewportSize({width,height});await p.locator('#game-menu').click();
  for(const route of ['news','inbox','settings']){await p.locator(`[data-menu="${route}"]`).click();assert(await p.locator('#sheet-bg').isHidden());assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.locator('.menu-page-heading [data-menu="home"]').click();}
  if(width===390)await p.screenshot({path:'docs/qa-incursions/menu-page-390.jpg',quality:85});await p.locator('.menu-page-heading [data-menu="return"]').click();
 }
 await p.evaluate(()=>{S.role=null;applyMode();go('lite');});await p.locator('#game-menu').click();assert(await p.locator('[data-view="menu"]').isVisible(),'civilian menu is a page too');await p.locator('[data-menu="settings"]').click();assert(await p.locator('#menu-page-content [data-intro="archive"]').isVisible());await p.keyboard.press('Escape');await p.locator('[data-menu="return"]').click();assert(await p.locator('[data-view="lite"]').isVisible());
 assert.deepEqual(errors,[]);console.log('Menu pages, list/detail/back, task return, single mail reward, quiet setting, three viewports and civilian mode passed');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
