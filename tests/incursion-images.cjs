const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict'),crypto=require('crypto');
const names=Array.from({length:100},(_,i)=>String(i).padStart(3,'0')+'.webp');
const dir='assets/incursions/cases';
assert.deepEqual(fs.readdirSync(dir).filter(n=>n.endsWith('.webp')).sort(),names);
const hashes=names.map(n=>crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,n))).digest('hex'));
assert.equal(new Set(hashes).size,100,'Every case must have a distinct source photograph');
const requested=new Set();
const server=http.createServer((q,r)=>{try{if(q.url.startsWith('/assets/incursions/cases/'))requested.add(q.url);const f=path.join(process.cwd(),q.url==='/'?'index.html':q.url);r.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});try{
 const p=await b.newPage({viewport:{width:390,height:680},reducedMotion:'no-preference'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);
 await p.evaluate(()=>{S.role='agent';S.onboarded=true;S.lite={intro:{done:true}};S.lastTick=Date.now()+600000;S.incursion={version:1,level:0,resolved:0,history:[]};applyMode();render();});
 assert.equal(requested.size,0,'Unseen case images must not preload');
 for(let kind=0;kind<100;kind++){
  await p.evaluate(kind=>{S.incursion={version:1,level:40,resolved:kind,event:{kind,tier:1,step:0,seen:0,round:0}};openIncursion();},kind);
  const photo=p.locator('.inc-case-photo img');await photo.evaluate(im=>im.decode());
  assert((await photo.getAttribute('src')).endsWith('/'+names[kind]));
  assert(await photo.evaluate(im=>im.naturalWidth>=1000&&im.naturalHeight>=600));
  assert.equal(requested.size,kind+1,'Only encountered cases load');
 }
 const variants=await p.evaluate(()=>Array.from({length:30},(_,n)=>incursionVariant({resolved:n*100,quiet:false},{kind:34,round:0})));
 assert(new Set(variants).size>=3,'Repeated encounters vary in appearance');
 // Reload keeps the same visual; animated image-space contact stays accurate.
 await p.evaluate(()=>{S.incursion={version:1,level:40,resolved:34,event:{kind:34,tier:1,step:1,seen:0,round:0,inspect:true}};openIncursion();markDirty();});
 const variant=await p.locator('.inc-contact-photo').getAttribute('data-variant');
 await p.reload();await p.evaluate(()=>openIncursion());assert.equal(await p.locator('.inc-contact-photo').getAttribute('data-variant'),variant);
 const photo=p.locator('.inc-contact-photo');await photo.locator('img').evaluate(im=>im.decode());await photo.scrollIntoViewIfNeeded();
 await photo.evaluate(el=>{el.dataset.motion='breathe';const anim=el.querySelector('img').getAnimations()[0];if(anim){anim.pause();anim.currentTime=3000;}});
 const target=await p.evaluate(()=>INC_VISUALS[INCURSIONS[34].visual].target);
 let box=await photo.locator('img').boundingBox();await p.mouse.click(box.x+5,box.y+5);assert.equal(await p.evaluate(()=>S.incursion.event.contacts||0),0);
 box=await photo.locator('img').boundingBox();await p.mouse.click(box.x+box.width*target[0],box.y+box.height*target[1]);assert.equal(await p.evaluate(()=>S.incursion.event.contacts),1);
 await p.emulateMedia({reducedMotion:'reduce'});assert.equal(await p.locator('.inc-contact-photo img').evaluate(im=>getComputedStyle(im).animationName),'none');
 await p.evaluate(()=>{S.incursion.quiet=true;drawIncursion();});assert.equal(await p.locator('.inc-case-photo').count(),0);assert(await p.locator('[data-inc="contact"]').isVisible());
 assert.deepEqual(errors,[]);console.log('100 unique photographs decode, load only on encounter, vary reproducibly, and preserve animated hit geometry / reduced-motion / quiet controls');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
