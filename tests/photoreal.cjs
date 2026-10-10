// Run: node tests/photoreal.cjs (requires Playwright + Chromium).
// QA_FONT optionally points to a local Japanese font for offline screenshots.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const root = process.cwd();
const out = path.join(root, 'docs/qa');
fs.mkdirSync(out, { recursive:true });
const baseline = execFileSync('git', ['show','bcf5fb6:index.html'], {encoding:'utf8'});
const server = http.createServer((req,res) => {
  const pathname = new URL(req.url,'http://localhost').pathname;
  try {
    if (pathname === '/baseline.html') {res.setHeader('Content-Type','text/html; charset=utf-8'); return res.end(baseline);}
    const file = pathname === '/qa-font.otf' ? process.env.QA_FONT : path.join(root, pathname === '/' ? 'index.html' : pathname);
    res.setHeader('Content-Type', file.endsWith('.html') ? 'text/html; charset=utf-8' : file.endsWith('.js') ? 'application/javascript' : file.endsWith('.css') ? 'text/css; charset=utf-8' : file.endsWith('.png') ? 'image/png' : file.endsWith('.webp') ? 'image/webp' : file.endsWith('.otf') ? 'font/otf' : 'image/svg+xml');
    res.end(fs.readFileSync(file));
  } catch {res.writeHead(404);res.end();}
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE || undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});
  try {
    const page = await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,reducedMotion:'no-preference'});
    page.setDefaultTimeout(10000);console.log('Browser started');const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route('https://**/*',r=>r.abort()); // No production account writes during QA.
    await page.addInitScript(()=>{
      const key='shinso_gacha_state_v1';if(localStorage.getItem(key))return;
      const d=new Date(),day=`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
      localStorage.setItem(key,JSON.stringify({role:'agent',onboarded:true,currency:500,pulls:0,lastTick:Date.now(),streak:{last:day,n:1},levels:{}}));
    });
    async function open(url='/') {
      console.log('Open',url);await page.goto(origin+url,{waitUntil:'domcontentloaded'});
      if(process.env.QA_FONT){await page.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/qa-font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}body,button{font-family:QAJP,sans-serif}"});await page.evaluate(()=>document.fonts.load('16px QAJP'));}
      await page.evaluate(()=>go('gacha'));
      await page.evaluate(()=>Promise.all([...document.styleSheets].flatMap(s=>{try{return [...s.cssRules].flatMap(r=>[...r.cssText.matchAll(/url\("?(assets\/[^\s"\)]+)"?\)/g)].map(m=>m[1]))}catch{return []}}).map(src=>new Promise(resolve=>{const im=new Image();im.onload=im.onerror=resolve;im.src=src}))));
    }
    await open('/baseline.html');
    await page.screenshot({path:path.join(out,'before-integration.jpg'),fullPage:true,quality:82});
    errors.length=0;await open();
    const imgs=await page.evaluate(async()=>{
      const names=['desk-background.webp','envelope.png','button-paper.png','button-red.png','button-locked.png','classified-files.png','surveillance-photo.png','red-lamp.png','film-canister.png','cassette.png'];
      return Promise.all(names.map(name=>new Promise(resolve=>{let im=new Image();im.onload=()=>resolve({name,width:im.naturalWidth,height:im.naturalHeight});im.onerror=()=>resolve({name,width:0});im.src='assets/'+name})));
    });
    assert(imgs.every(i=>i.width>0),'all ten images must decode in Chromium');
    for(const [w,h] of [[390,844],[375,667],[320,568],[430,932],[1280,900]]){
      await page.setViewportSize({width:w,height:h});
      // ResizeObserver settles the illustration on the next paint; measure the rendered layout.
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const layout=await page.evaluate(()=>({width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,viewport:innerHeight,buttons:[...document.querySelectorAll('[data-pull]')].filter(e=>!e.hidden).map(e=>{const r=e.getBoundingClientRect();return {w:r.width,h:r.height,bottom:r.bottom}}),nav:document.querySelector('.nav').getBoundingClientRect().top}));
      assert(layout.width<=w,`horizontal overflow ${w}`);
      assert(layout.buttons.every(b=>b.w>=44&&b.h>=44&&b.bottom<=layout.nav),`CTA hit area/occlusion ${w}: ${JSON.stringify(layout)}`);
      if(w<600)assert(layout.height<=h+1,`unnecessary scroll ${w}: ${JSON.stringify(layout)}`);
      await page.screenshot({path:path.join(out,`gacha-${w}.jpg`),fullPage:true,quality:82});
    }
    await page.setViewportSize({width:390,height:844});
    assert.equal(await page.locator('[data-pull="10"]').isVisible(),false);
    assert.equal(await page.locator('[data-pull="100"]').isVisible(),false);
    await page.evaluate(()=>{S.currency=500;S.lastTick=Date.now();render()});
    await page.locator('[data-pull="1"]').click();
    assert.deepEqual(await page.evaluate(()=>({pt:S.currency,pulls:S.pulls})),{pt:490,pulls:1});
    assert(await page.locator('#stage').isVisible(),'envelope opening stage');
    await page.locator('#st-scene').click();await page.locator('#st-card.reveal').waitFor({state:'visible'});
    await page.keyboard.press('Escape');
    const beforeFive=await page.evaluate(()=>({truths:ITEMS.filter(i=>lv(i.id)===5).length,testimonies:S.tcount||0}));
    await page.locator('[data-pull="5"]').click();
    const afterFive=await page.evaluate(()=>({pt:S.currency,pulls:S.pulls,truths:ITEMS.filter(i=>lv(i.id)===5).length,testimonies:S.tcount||0}));
    assert.equal(afterFive.pulls,6);assert.equal(afterFive.pt,445+50*(afterFive.truths-beforeFive.truths)+3*(afterFive.testimonies-beforeFive.testimonies));
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    for(const [pulls,ten,hundred] of [[74,false,false],[75,true,false],[949,true,false],[950,true,true]]){
      await page.evaluate(p=>{S.pulls=p;render()},pulls);
      assert.equal(await page.locator('[data-pull="10"]').isVisible(),ten);
      assert.equal(await page.locator('[data-pull="100"]').isVisible(),hundred);
    }
    for(const [n,cost] of [[10,90],[100,850]]){
      await page.evaluate(()=>{S.currency=2000;S.lastTick=Date.now();render()});const before=await page.evaluate(()=>({pulls:S.pulls,levels:totalLv(),truths:ITEMS.filter(i=>lv(i.id)===5).length}));await page.evaluate(()=>Math.random=()=>0.5);
      await page.locator(`[data-pull="${n}"]`).click();
      const after=await page.evaluate(()=>({pt:S.currency,pulls:S.pulls,levels:totalLv(),truths:ITEMS.filter(i=>lv(i.id)===5).length}));assert.equal(after.pulls,before.pulls+n);assert.equal(after.pt,2000-cost+3*(n-(after.levels-before.levels))+50*(after.truths-before.truths));
      await page.keyboard.press('Escape');
    }
    await page.evaluate(()=>{S.currency=0;render()});
    assert(await page.locator('[data-pull="1"]').isDisabled());
    assert((await page.locator('[data-pull="1"]').evaluate(e=>getComputedStyle(e).borderImageSource)).includes('button-locked.png'));
    await page.evaluate(()=>{S.currency=500;S.lastTick=Date.now();ensureMissions();S.missions.click10={p:10,claimed:false};S.missions.pull3={p:3,claimed:false};S.missions.layer2={p:0,claimed:false};S.missions.share1={p:1,claimed:true};render();go('home');setHomeTab('tasks')});
    await page.locator('#claim-all').click();
    assert.equal(await page.evaluate(()=>S.currency),535);
    assert.equal(await page.locator('#claim-all').isVisible(),false);
    await page.evaluate(()=>document.querySelector('#claim-all').click());
    assert.equal(await page.evaluate(()=>S.currency),535,'no double claim');
    await page.locator('#wallet').click();assert(await page.locator('.wallet-summary').isVisible());await page.keyboard.press('Escape');
    await page.evaluate(()=>go('report'));await page.locator('#agent-record').click();
    assert((await page.locator('#rk-lv').innerText()).includes('RANK 11'));
    await page.keyboard.press('Escape');
    // Exercise the existing cloud boundary with a stub; never mutate real Firebase.
    const cloudResult=await page.evaluate(async()=>{
      const writes=[];FB={getCountFromServer:async()=>({data:()=>({count:0})}),collection:()=>({}),db:{}};
      cloud={revision:0,transaction:async fn=>fn({get:async()=>({exists:()=>false}),set:(ref,data)=>writes.push({ref,data})}),canWrite:true,uid:'qa',saveRef:'users/qa',scoutRef:'scouts/qa',setDoc:async(ref,data)=>writes.push({ref,data})};
      markDirty();clearTimeout(flushT);await flush();
      const snapshot=writes.find(w=>w.ref==='users/qa').data.state;
      FB.getDoc=async()=>({exists:()=>true,data:()=>({revision:1,state:{...snapshot,currency:777,updatedAt:Date.now()+10000}})});
      await pullRemote();const restored=S.currency;
      cloud.transaction=async()=>{throw {code:'permission-denied'}};await flush();
      return {saved:snapshot.currency,claimed:snapshot.missions.click10.claimed,restored,fallback:!cloud.canWrite,sync:document.querySelector('#sync').textContent};
    });
    assert.deepEqual({saved:cloudResult.saved,claimed:cloudResult.claimed,restored:cloudResult.restored,fallback:cloudResult.fallback},{saved:535,claimed:true,restored:777,fallback:true});
    await page.reload();
    assert.equal(await page.evaluate(()=>S.currency),777,'local reload preserves state');
    assert.equal(await page.evaluate(()=>S.missions.click10.claimed),true);
    assert.deepEqual(errors,[],'uncaught browser errors');
    const report={passed:true,images:imgs,viewports:['390×844','375×667','320×568','430×932','1280×900'],checks:['1/5/10/100 actual button pulls and costs','rank unlock boundaries','disabled CTA','claim-all and duplicate protection','wallet rank','local reload','Firebase save/restore/permission-denied adapter'],cloud:'stubbed; live Firebase not written',errors};
    fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
  } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
