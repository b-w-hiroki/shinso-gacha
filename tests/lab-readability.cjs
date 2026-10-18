const {chromium,webkit}=require('playwright'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const server=http.createServer((req,res)=>{try{const u=new URL(req.url,'http://localhost'),f=u.pathname==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),u.pathname==='/'?'index.html':u.pathname);res.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404);res.end();}});
const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number),lum=s=>rgb(s).map(n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4}).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await (process.env.QA_WEBKIT?webkit:chromium).launch(process.env.QA_WEBKIT?{}:{args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const p=await b.newPage({viewport:{width:390,height:680},hasTouch:true,reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);
  if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
  await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+600000;S.streak={last:dayKey(),n:1};S.incursion={version:1,level:0,resolved:0,history:[]};S.currency=5000;S.levels.u2=3;S.legends=LegendModel.state({},S.levels);LegendModel.start(S.legends,S.levels,'u2');S.observation=WatchModel.create(Date.now(),42);const o=S.observation;o.mode='vision';o.collected=35;o.upgrades.retention=1;applyMode();go('lab');render();});
  const snapshot=()=>p.evaluate(()=>JSON.stringify({currency:S.currency,collected:S.observation.collected,upgrades:S.observation.upgrades,pending:S.observation.pending,collection:S.observation.collection}));const before=await snapshot();let minimum=100,checks=0;
  for(const [width,height] of [[320,568],[390,680],[390,844],[430,932],[844,390]]){
   await p.setViewportSize({width,height});await p.evaluate(()=>{go('lab');renderObservationLab();document.querySelector('.watch-upgrades').open=false;document.querySelector('.watch-route-details').open=false;scrollTo(0,0);});
   const geometry=await p.evaluate(()=>{const panel=document.querySelector('.watch-lab').getBoundingClientRect(),up=document.querySelector('.watch-upgrades summary').getBoundingClientRect(),routes=document.querySelector('.watch-route-details').getBoundingClientRect();return {panelTop:panel.top,upTop:up.top,routesTop:routes.top,overflow:document.documentElement.scrollWidth-innerWidth};});
   assert(geometry.upTop-geometry.panelTop<=160,JSON.stringify(geometry));assert(geometry.upTop<geometry.routesTop);assert(geometry.overflow<=0);
   assert((await p.locator('.watch-lab-context').innerText()).includes('商店街'));assert((await p.locator('.watch-lab-context').innerText()).includes('きさらぎ駅'));
   for(const selector of ['.watch-upgrades summary','.watch-route-details summary']){const el=p.locator(selector);await el.scrollIntoViewIfNeeded();await el.tap();}
   assert(await p.locator('.watch-mode').first().isVisible());assert.equal(await p.locator('.watch-mode').count(),4);
   const pairs=await p.evaluate(()=>[...document.querySelectorAll('.watch-lab-heading h2,.watch-lab-links button,.watch-lab-context span,.watch-upgrades>summary,.watch-upgrades b,.watch-upgrades small,.watch-upgrades button,.watch-lab .watch-note,.watch-route-details>summary,.watch-mode b,.watch-mode small,.watch-mode>span')].filter(e=>e.getClientRects().length).map(e=>{
    const s=getComputedStyle(e);let bg=null;for(let el=e;el;el=el.parentElement){const c=getComputedStyle(el).backgroundColor,nums=c.match(/[\d.]+/g)?.map(Number);if(nums&&(nums.length===3||nums[3]===1)){bg=c;break;}}
    return {text:e.textContent.trim().slice(0,45),fg:s.color,bg};
   }));
   for(const pair of pairs){assert(pair.bg,'solid readable surface '+pair.text);const a=lum(pair.fg),c=lum(pair.bg),ratio=(Math.max(a,c)+.05)/(Math.min(a,c)+.05);minimum=Math.min(minimum,ratio);checks++;assert(ratio>=4.5,JSON.stringify({...pair,ratio}));}
   assert.equal(await p.locator('.watch-lab [data-watch="return"]').count(),0,'lab uses the existing bottom navigation');
   assert(await p.locator('.watch-lab [data-watch="settings"]').evaluate(e=>{e.scrollIntoView({block:'center',behavior:'instant'});const r=e.getBoundingClientRect(),t=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return r.width>=44&&r.height>=44&&(e===t||e.contains(t));}),'settings readable and reachable');
   await p.evaluate(()=>renderObservationLab());assert(await p.locator('.watch-route-details').evaluate(e=>e.open),'route disclosure remains open after repaint');assert(await p.locator('.watch-upgrades').evaluate(e=>e.open),'upgrade disclosure remains open after repaint');
  }
  assert.equal(await snapshot(),before,'viewing routes and checking colors must not change progress');
  await p.setViewportSize({width:390,height:680});
  await p.locator('.lab-contradiction summary').focus();await p.evaluate(()=>{document.querySelector('.lab-contradiction').open=true;renderObservationLab();});
  assert(await p.locator('.lab-contradiction').evaluate(e=>e.open));assert(await p.locator('.lab-contradiction summary').evaluate(e=>e===document.activeElement),'case summary retains keyboard focus');
  await p.locator('[data-watch-upgrade="retention"]').focus();await p.evaluate(()=>renderObservationLab());assert(await p.locator('[data-watch-upgrade="retention"]').evaluate(e=>e===document.activeElement),'eligible upgrade retains focus');
  await p.evaluate(()=>{S.currency=0;renderObservationLab();});const poor=p.locator('[data-watch-upgrade="retention"]');assert(await poor.isDisabled());assert((await poor.getAttribute('aria-label')).includes('あと'));assert(await poor.locator('..').locator('.watch-upgrade-hint').isVisible());assert(await p.locator('.watch-upgrades>summary').evaluate(e=>e===document.activeElement),'disabled replacement returns focus to the upgrade heading');
  await p.evaluate(()=>{observationState().upgrades.retention=WatchModel.UPGRADES.retention.max;renderObservationLab();});assert(await poor.isDisabled());assert((await poor.getAttribute('aria-label')).includes('最大レベル'));assert.equal(await poor.locator('..').locator('.watch-upgrade-hint').count(),0,'max is not reported as a pt shortage');
  await p.evaluate(()=>{S.currency=5000;observationState().upgrades.retention=1;renderObservationLab();});assert.equal(await snapshot(),before,'status explanations do not mutate progress');
  await p.evaluate(()=>{for(const item of ITEMS.filter(i=>i.id!==SECRET.id).slice(0,3)){S.levels[item.id]=5;(S.research||(S.research={}))[item.id]=3;}renderLab();setSectionTab('lab:research');});
  const cross=p.locator('#research-list .research-card').filter({has:p.locator('[data-act="cross-file"]')});assert(await cross.isVisible(),'completed cross-file appears after three researches');
  const crossColors=await cross.evaluate(e=>({body:getComputedStyle(e.querySelector('.up-eff')).color,note:getComputedStyle(e.querySelector('.note')).color,stamp:getComputedStyle(e,'::before').color}));
  for(const [part,foreground] of Object.entries(crossColors))for(const background of ['rgb(41, 35, 27)','rgb(20, 17, 13)']){const a=lum(foreground),c=lum(background),ratio=(Math.max(a,c)+.05)/(Math.min(a,c)+.05);assert(ratio>=4.5,`${part} on dark research card: ${ratio.toFixed(2)}:1`);}
  await p.setViewportSize({width:390,height:680});await p.evaluate(()=>{go('home');renderObservation();});await p.locator('#obs-equipment').tap();assert(await p.locator('.watch-upgrades').evaluate(e=>e.open));assert(await p.locator('[data-watch-upgrade="retention"]').isVisible());
  await p.locator('.watch-lab [data-watch="settings"]').tap();assert(await p.locator('.watch-settings').isVisible());await p.keyboard.press('Escape');await p.locator('.nav [data-nav="home"]').tap();assert(await p.locator('#obs-frame').isVisible());
  assert.deepEqual(errors,[]);console.log(`Lab readability: ${checks} text/surface pairs >=4.5:1 (minimum ${minimum.toFixed(2)}), compact upgrade entry, routes, real taps and unchanged progress passed`);
 }finally{await b.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
