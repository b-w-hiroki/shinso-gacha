// Shared UI QA. Requires Playwright; optional CHROMIUM_EXECUTABLE and QA_FONT.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=process.cwd(),out=path.join(root,'docs/qa-ui');fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{
 try{const u=new URL(req.url,'http://localhost');const file=u.pathname==='/qa-font.otf'?process.env.QA_FONT:path.join(root,u.pathname==='/'?'index.html':u.pathname);res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':file.endsWith('.otf')?'font/otf':file.endsWith('.png')?'image/png':file.endsWith('.webp')?'image/webp':'image/jpeg');res.end(fs.readFileSync(file))}catch{res.writeHead(404);res.end()}
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 const b=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});
 try{
  const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,reducedMotion:'reduce'});p.setDefaultTimeout(10000);
  const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());
  await p.addInitScript(()=>{if(localStorage.getItem('shinso_gacha_state_v1'))return;const d=new Date(),day=`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;localStorage.setItem('shinso_gacha_state_v1',JSON.stringify({role:'agent',onboarded:true,agentNo:'0618',currency:500,pulls:120,evi:200,levels:{u1:2,u2:5,c1:1},lastTick:Date.now(),streak:{last:day,n:1}}))});
  async function font(){if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/qa-font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}body,button{font-family:QAJP,sans-serif}"});await p.evaluate(()=>document.fonts.load('16px QAJP'))}}
  async function shot(name){await p.locator('.toast').evaluateAll(es=>es.forEach(e=>e.hidden=true));await p.screenshot({path:path.join(out,name+'.jpg'),quality:83,animations:'disabled'});}
  async function widthCheck(label){const v=await p.evaluate(()=>({w:document.documentElement.scrollWidth,v:innerWidth}));assert(v.w<=v.v,`${label} horizontal overflow: ${JSON.stringify(v)}`)}
  await p.goto(origin);await font();
  assert(await p.locator('.nav').isVisible(),'home navigation must be available');
  await shot('home-390');
  await p.locator('[data-htab="tasks"]').click();assert(!(await p.locator('.agent-footer').isVisible()),'no unrelated large action on tasks');await shot('tasks-390');
  for(const [w,h] of [[390,844],[320,568],[1280,900]]){
   await p.setViewportSize({width:w,height:h});
   for(const v of ['home','archive','lab','report']){
    await p.locator(`.nav [data-nav="${v}"]`).click();await widthCheck(v+' '+w);
    if(w===390||w===320)await shot(v+'-'+w);
    const nav=await p.locator('.nav').boundingBox();assert(nav.y+nav.height<=h+1,'nav fits viewport');
    if(v==='home'){
     if(h<740)await p.locator('#agent-primary').scrollIntoViewIfNeeded();const btn=await p.locator('#agent-primary').boundingBox();assert(btn&&btn.height>=44&&btn.y+btn.height<=nav.y,'home CTA must sit above nav');
    }
   }
  }
  await p.setViewportSize({width:390,height:844});
  await p.locator('.nav [data-nav="archive"]').click();
  await p.locator('[data-chip="conspiracy"]').click();assert.equal(await p.locator('[data-chip="conspiracy"]').getAttribute('aria-pressed'),'true');
  await p.locator('#files [data-act="dossier"][data-id="c1"]').click();assert(await p.locator('.sheet .doc').isVisible());await shot('dossier-390');
  const close=await p.locator('.sheet .x').boundingBox();assert(close.width>=44&&close.height>=44);await p.locator('.sheet .x').click();
  await p.locator('[data-stab="archive:testimony"]').click();assert(await p.locator('.tbook').isVisible());await widthCheck('testimony');
  await p.locator('.nav [data-nav="lab"]').click();
  await p.locator('[data-act="upgrade"][data-id="radio"]').click();
  assert.deepEqual(await p.evaluate(()=>({lv:upLv('radio'),evi:S.evi})),{lv:1,evi:188});
  await p.locator('[data-stab="lab:research"]').click();
  await p.locator('[data-act="research"][data-id="u2"]').click();assert.deepEqual(await p.evaluate(()=>({lv:researchLv('u2'),evi:S.evi})),{lv:1,evi:180});await shot('research-390');
  await p.locator('.nav [data-nav="report"]').click();
  await p.locator('#share-report').click();assert(await p.locator('#sheet-bg').isVisible());await p.locator('.sheet .x').click();
  await p.locator('[data-stab="report:achieve"]').click();assert(await p.locator('.stats').isVisible());await shot('achievements-390');
  await p.locator('[data-stab="report:settings"]').click();assert(await p.locator('#sync').isVisible());await widthCheck('settings');
  await p.locator('#wallet').click();assert(await p.locator('.wallet-rank').isVisible());await shot('wallet-390');await p.locator('.sheet .x').click();
  await p.reload();await font();assert.deepEqual(await p.evaluate(()=>({up:upLv('radio'),research:researchLv('u2'),evi:S.evi})),{up:1,research:1,evi:180});
  await p.locator('.nav [data-nav="gacha"]').click();await p.locator('[data-pull="1"]').click();
  assert((await p.locator('#st-env').evaluate(e=>getComputedStyle(e).backgroundImage)).includes('envelope.png'));await shot('opening-390');
  await p.locator('#st-scene').click();await p.locator('#st-card.reveal').waitFor({state:'visible'});await shot('opened-390');await p.keyboard.press('Escape');
  // New-user mode must still initialize after shared shell changes.
  await p.evaluate(()=>localStorage.removeItem('shinso_gacha_state_v1'));await p.context().clearCookies();
  await p.evaluate(()=>localStorage.setItem('shinso_gacha_state_v1',JSON.stringify({currency:30,pulls:0,lastTick:Date.now(),levels:{}})));await p.reload();await font();assert(await p.locator('[data-view="lite"]').isVisible());assert(await p.locator('#lite-pull').isVisible());await widthCheck('new user');
  // All new raster files decode; cutout center must remain transparent.
  const assets=['civilian-desk','civilian-envelope','radar-bezel','mission-clipboard','archive-folder','evidence-paper','photo-frame','audio-analyzer','report-paper','appointment-paper','rank-insignia','danger-overlay'];
  for(const name of assets){const result=await p.evaluate(async name=>{const im=new Image();im.src='/assets/ui/'+name+'.webp';await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);return {width:im.width,alpha:x.getImageData(im.width/2,im.height/2,1,1).data[3]};},name);assert(result.width>=1000);if(['radar-bezel','photo-frame','danger-overlay'].includes(name))assert.equal(result.alpha,0,name+' has transparent center');}
  for(const width of [320,390]){await p.setViewportSize({width,height:844});await widthCheck('lite '+width);const rect=await p.locator('#lite-pull').boundingBox();assert(rect.height>=44&&rect.y+rect.height<844);await shot('lite-'+width);}
  await p.locator('#lite-pull').click();assert.equal(await p.evaluate(()=>S.lite.pulls),1);await p.keyboard.press('Escape');
  await p.locator('[data-ltab="files"]').click();assert(!(await p.locator('#lite-pull').isVisible()));await p.locator('[data-ltab="open"]').click();
  await p.evaluate(()=>{S.lite.lv=Object.fromEntries(LITE_IDS.map((id,i)=>[id,i<10?3:0]));renderLite();});
  assert(await p.locator('body.phase-crisis').count());assert((await p.locator('body').evaluate(e=>getComputedStyle(e,'::after').backgroundImage)).includes('danger-overlay.webp'));assert.equal(await p.locator('body').evaluate(e=>getComputedStyle(e,'::after').pointerEvents),'none');await shot('danger-390');
  await p.evaluate(()=>{S.agentNo='0618';S.agentType='境界観測型';S.assign='都市伝説';showAgentWelcome();});assert(await p.locator('.appointment-paper').isVisible());await shot('appointment-390');await p.locator('.sheet .x').click();
  // This fixture tests rank notifications, not the delayed daily-login toast.
  // Suppress that unrelated notification just as the initial agent fixture does.
  await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.streak={last:dayKey(),n:1};S.lastTick=Date.now();save();});await p.reload();await font();
  for(const [tier,pulls] of await p.evaluate(()=>[0,5,10,15].map(i=>[Math.floor(i/5),RANKS[i].need]))){await p.evaluate(pulls=>{S.pulls=pulls;render();},pulls);await p.locator('#wallet').click();assert.equal(await p.locator('.wallet-rank .rank-emblem').getAttribute('data-tier'),String(tier));await p.locator('.sheet .x').click();}
  await p.evaluate(()=>{sheet('証拠画像の確認','<div class="ev-cctv"><b>記録照合中</b></div><div class="ev-audio"><div class="wave">音声解析</div></div>');});await shot('evidence-390');await p.locator('.sheet .x').click();
  await p.evaluate(()=>{rankNews=rank().name;notify();});await p.locator('.toast .rank-emblem').waitFor();await p.screenshot({path:path.join(out,'promotion-390.jpg'),quality:83,animations:'disabled'});
  assert.deepEqual(errors,[]);const report={passed:true,checks:['home navigation + task-specific CTA','320/390/1280 width and navigation','archive filter + dossier + testimony','44px modal close control','equipment upgrade and evidence deduction','re-investigation and persistence','report share draft + achievements + settings','wallet rank','photoreal opening and reveal','new-user initialization','12 image decodes + transparent centers','civilian opening + tabs','danger overlay does not intercept controls','appointment document','all four rank emblem tiers + promotion notification'],errors};fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
 }finally{await b.close();server.close()}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
