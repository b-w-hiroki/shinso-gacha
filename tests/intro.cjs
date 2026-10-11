const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const out='docs/qa-intro';fs.mkdirSync(out,{recursive:true});
const server=http.createServer((q,r)=>{try{const u=new URL(q.url,'http://localhost'),f=u.pathname==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),u.pathname==='/'?'index.html':u.pathname);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':f.endsWith('.webp')?'image/webp':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});
try{const p=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());
async function font(){if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP}body,button{font-family:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}}
async function shot(name){
 const image=p.locator('#intro-case:not([hidden]) figure img');
 if(await image.count()) await image.evaluate(async img=>{await img.decode();if(!img.naturalWidth)throw new Error('intro image missing after decode');});
 const title=p.locator('#intro-case:not([hidden]) h1');
 if(await title.count()) {
  const pos=await title.evaluate(el=>({heading:el.getBoundingClientRect().top,menu:document.querySelector('header.top #game-menu').getBoundingClientRect().bottom}));
  assert(pos.heading>=pos.menu-1,'introduction heading must not be covered by the menu: '+JSON.stringify(pos));
 }
 await p.screenshot({path:out+'/'+name+'.jpg',quality:85,animations:'disabled'});
}
async function fresh(state={}){await p.goto(origin);await p.evaluate(s=>localStorage.setItem('shinso_gacha_state_v1',JSON.stringify({currency:30,lastTick:Date.now(),levels:{},...s})),state);await p.reload();await font();}
async function next(){await p.waitForFunction(()=>!introBusy);await p.locator('#lite-pull').click();}
await fresh();assert(await p.locator('#intro-case').isVisible());assert.equal(await p.locator('#intro-case [data-intro="skip"]').count(),0,'opening contains no skip label');assert.equal(await p.locator('.lite-tabs').isVisible(),false,'no navigation before discovery');assert(await p.locator('#game-menu').isVisible(),'settings remains reachable before navigation unlock');assert.equal(await p.locator('header.top .logo').isVisible(),false,'branding stays out of the opening image');
await p.locator('#game-menu').click();assert(await p.locator('[data-view="menu"]').isVisible(),'settings page opens during introduction');assert(await p.locator('[data-view="menu"] [data-intro="skip"]').isVisible(),'skip moved inside optional menu');await p.locator('[data-menu="settings"]').click();assert(await p.locator('[data-watch-quiet]').isVisible(),'quiet mode available from first envelope');await p.locator('[data-watch-quiet]').check();assert(await p.locator('body.intro-quiet').count(),'quiet preference affects civilian presentation');await p.locator('.menu-page-heading [data-menu="home"]').click();await p.locator('.menu-page-heading [data-menu="return"]').click();assert(await p.locator('#intro-case').isVisible(),'return preserves initial envelope');
for(const [width,height] of [[320,568],[390,844],[430,932]]){await p.setViewportSize({width,height});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const c=await p.locator('#lite-pull').boundingBox();assert(c.height>=44&&c.y+c.height<height);await shot('sealed-'+width);}
await p.setViewportSize({width:390,height:844});await next();assert.equal(await p.evaluate(()=>S.lite.pulls),1);assert.equal(await p.evaluate(()=>S.lite.intro.step),1);assert(await p.locator('#intro-case h1').evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<innerHeight/3;}),'new scene heading remains visible after bottom CTA');await shot('photo-before');
await p.reload();await font();assert.equal(await p.evaluate(()=>S.lite.intro.step),1);await next();assert.equal(await p.evaluate(()=>S.lite.pulls),1);await shot('photo-after');
await p.setViewportSize({width:320,height:568});const compare=await p.locator('.intro-compare').boundingBox(),footer=await p.locator('.lite-footer').boundingBox();assert(compare.y+compare.height<=footer.y,'comparison controls must stay above footer on short phones');await shot('photo-after-320');await p.setViewportSize({width:390,height:844});
await p.locator('[data-intro="before"]').click();assert((await p.locator('#intro-case figure img').getAttribute('src')).includes('station-before'));await p.locator('[data-intro="after"]').click();
await next();assert.equal(await p.evaluate(()=>S.lite.pulls),2);await shot('plan');await next();assert.equal(await p.evaluate(()=>S.lite.pulls),3);await shot('note-sealed');
await next();assert.equal(await p.locator('.intro-redaction').getAttribute('aria-expanded'),'true');await shot('note-revealed');await next();assert(!(await p.locator('#intro-case').isVisible()));assert.equal(await p.evaluate(()=>liteTotal()),3);assert.equal(await p.evaluate(()=>S.lite.intro.completed),true);
await p.reload();await font();assert(!(await p.locator('#intro-case').isVisible()));
assert(await p.locator('[data-ltab="files"]').isVisible(),'archive unlocks after initial documents');
assert.equal(await p.locator('[data-ltab="notes"]').isVisible(),false,'record archive remains locked until six fragments');assert.equal(await p.locator('.lite-tabs #game-menu').count(),0,'menu stays out of footer until ten fragments');
const count=await p.evaluate(()=>S.lite.pulls);
await p.evaluate(()=>{for(const id of LITE_IDS.slice(0,6))S.lite.lv[id]=Math.max(S.lite.lv[id]||0,1);renderLite();});
assert(await p.locator('[data-ltab="notes"]').isVisible(),'records unlock after six fragments');assert.equal(await p.locator('.lite-tabs #game-menu').count(),0,'menu still stays in header');
await p.evaluate(()=>{S.lite.lv=Object.fromEntries(LITE_IDS.map((id,i)=>[id,i<3?3:i===3?1:0]));renderLite();});
assert.equal(await p.locator('.lite-tabs #game-menu').count(),1,'menu joins footer after ten fragments');
await p.locator('[data-ltab="notes"]').click();await p.locator('.lite-pane [data-intro="archive"]').click();assert(await p.locator('.intro-archive').isVisible());await p.locator('.sheet .x').click();assert.equal(await p.evaluate(()=>S.lite.pulls),count);
await fresh();await p.locator('#game-menu').click();await p.locator('[data-view="menu"] [data-intro="skip"]').click();assert.equal(await p.evaluate(()=>liteTotal()),0);assert.equal(await p.locator('.lite-tabs').isVisible(),false,'skipping never unlocks navigation');await p.reload();await font();assert(!(await p.locator('#intro-case').isVisible()));await p.locator('#lite-pull').click();assert.equal(await p.evaluate(()=>S.lite.pulls),1);
await fresh({lite:{lv:{u1:1},pulls:1}});assert(!(await p.locator('#intro-case').isVisible()),'existing player is not forced into introduction');
await p.evaluate(()=>{S.lite.lv=Object.fromEntries(LITE_IDS.map((id,i)=>[id,i<11?3:0]));renderLite();});assert(await p.locator('#lite-rescue img').isVisible());await shot('intervention');
await p.evaluate(()=>{S.lite.lv=Object.fromEntries(LITE_IDS.map(id=>[id,3]));renderLite();});await p.locator('#lite-apply').click();assert(await p.locator('#sheet-bg').isVisible());await p.locator('.sheet .x').click();
// Double taps must not award a second letter or skip the comparison.
await fresh();await p.locator('#lite-pull').dblclick();assert.equal(await p.evaluate(()=>S.lite.pulls),1);assert.equal(await p.evaluate(()=>S.lite.intro.step),1);
await p.evaluate(()=>{S.role='agent';S.onboarded=true;applyMode();});assert(await p.locator('header.top').isVisible(),'header returns after becoming an agent');assert.equal(await p.locator('body.intro-active').count(),0,'intro presentation state clears on role change');
for(const a of JSON.parse(fs.readFileSync('assets/intro/manifest.json'))){await p.evaluate(async src=>{const im=new Image();im.src=src;await im.decode();},a.path);}
assert.deepEqual(errors,[]);fs.writeFileSync(out+'/results.json',JSON.stringify({passed:true,checks:['fresh + existing user','progressive footer unlocks','320/390/430 mobile controls','photo comparison','exactly three ordinary draws','reload resume','redaction reveal','skip + replay without rewards','33 fragment intervention + 36 interview gate','double tap guard','7 image decodes'],errors},null,2)+'\n');console.log('Introduction checks passed');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1});
