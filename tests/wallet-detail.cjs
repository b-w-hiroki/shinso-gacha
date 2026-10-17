const {chromium,webkit}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const server=http.createServer((q,r)=>{try{const f=q.url==='/font.otf'?process.env.QA_FONT:path.join(process.cwd(),q.url.split('?')[0]==='/'?'index.html':q.url.split('?')[0]);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const engine=process.env.QA_WEBKIT?webkit:chromium;
 const b=await engine.launch(process.env.QA_WEBKIT?{}:{executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});
 try{
  // One page only: --single-process Chromium cannot create extra contexts. Time is local on both sides.
  const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());
  await p.clock.install({time:new Date('2026-10-17T10:00:00')});await p.goto('http://127.0.0.1:'+server.address().port);
  if(process.env.QA_FONT){await p.addStyleTag({content:"@font-face{font-family:QAJP;src:url('/font.otf')} :root{--f-body:QAJP;--f-display:QAJP;--f-mono:QAJP;--f-hand:QAJP}body,button{font-family:QAJP}"});await p.evaluate(()=>document.fonts.load('16px QAJP'));}
  const setup=(rank,radio)=>p.evaluate(({rank,radio})=>{hideSheet();S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.pulls=RANKS[rank].need;S.ups={radio,phone:1};S.lastTick=Date.now();S.currency=1234;S.observation=WatchModel.create(Date.now(),42);S.incursion={version:1,level:0,resolved:0,history:[]};S.streak={last:dayKey(),n:1};applyMode();go('home');render();},{rank,radio});
  // Daytime, RANK 5 + radio Lv.10 -> x1.20 * x2.00 = x2.40 -> 5000/2.4 = 2083 ms
  await setup(4,10);
  const before=await p.evaluate(()=>JSON.stringify({c:S.currency,t:S.lastTick,u:S.ups,pulls:S.pulls}));
  await p.locator('#wallet').click();
  const text=await p.locator('.wallet-breakdown').innerText();
  for(const want of ['+1ptの間隔','2.1秒','次の獲得まで','1分あたり','約29pt','ランク補正（RANK 5）','×1.20','設備補正（盗聴ラジオ Lv.10）','×2.00','丑三つ時','×2.0（時間外）'])assert(text.includes(want),'missing '+want+' in '+text);
  assert((await p.locator('#wallet-hour').innerText()).includes('約1,728pt / 時間'));
  assert((await p.locator('.wallet-note').innerText()).includes('上限3時間'),'phone Lv.1 -> 3h cap');
  // Countdown moves with time and never shows a gauge or tap counter.
  const n1=await p.locator('#wallet-next').innerText();await p.clock.runFor(1000);const n2=await p.locator('#wallet-next').innerText();
  assert.notEqual(n1,n2,'next-credit countdown must update while the sheet is open');
  assert.equal(await p.locator('.wallet-breakdown progress,.wallet-breakdown meter,.wallet-breakdown [role="progressbar"]').count(),0);
  // Passive income may credit points while time runs; opening the sheet itself must not.
  // Opening the sheet never changes upgrades or rank; points only change through the normal tick.
  const after=JSON.parse(await p.evaluate(()=>JSON.stringify({u:S.ups,pulls:S.pulls})));assert.deepEqual(after,{u:{radio:10,phone:1},pulls:JSON.parse(before).pulls});
  for(const [w,h] of [[320,568],[390,844],[844,390]]){
   await p.setViewportSize({width:w,height:h});await p.locator('.wallet-breakdown').scrollIntoViewIfNeeded();
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow at '+w);
   assert(await p.locator('.wallet-breakdown > div').evaluateAll(xs=>xs.every(x=>{const r=x.getBoundingClientRect();return r.height>=44&&r.right<=innerWidth;})),'rows readable at '+w);
   if(w===390)await p.screenshot({path:'docs/qa-incursions/wallet-detail-390.jpg',quality:85});
  }
  assert.deepEqual(errors,[]);
  // 02:30 -> the interval halves, labelled as active now.
  await p.setViewportSize({width:390,height:844});await p.clock.setSystemTime(new Date('2026-10-17T02:30:00'));await setup(0,0);
  await p.locator('#wallet').click();const night=await p.locator('.wallet-breakdown').innerText();
  assert(night.includes('2.5秒')&&night.includes('いま ×2.0'),night);assert((await p.locator('#wallet-hour').innerText()).includes('約1,440pt / 時間'));
  await p.screenshot({path:'docs/qa-incursions/wallet-detail-ushi-390.jpg',quality:85});assert.deepEqual(errors,[]);
  console.log('Wallet detail: interval, minute/hour, countdown, rank/gear multipliers, ushimitsu, caps, 3 viewports and unchanged save passed');
 }finally{await b.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
