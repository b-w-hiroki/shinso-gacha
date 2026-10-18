const {chromium,webkit}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const manifest=JSON.parse(fs.readFileSync('assets/ui/clean-manifest.json','utf8'));
const consumers=['assets/physical-ui.css','assets/incursions.css','assets/intro-story.js'].map(p=>fs.readFileSync(p,'utf8')).join('\n');
let oldBytes=0,newBytes=0;
for(const a of manifest.assets){const bytes=fs.readFileSync(a.path);assert.equal(bytes.length,a.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),a.sha256);assert(consumers.includes(a.path.replace('assets/','')));assert(!consumers.includes(a.originalPath.replace('assets/','')));oldBytes+=fs.statSync(a.originalPath).size;newBytes+=bytes.length;}
assert(newBytes<=oldBytes);assert(!consumers.includes("url('ui/danger-overlay.webp')"));
const server=http.createServer((req,res)=>{try{const u=new URL(req.url,'http://localhost'),file=path.join(process.cwd(),u.pathname==='/'?'index.html':u.pathname);res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'image/webp');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await (process.env.QA_WEBKIT?webkit:chromium).launch(process.env.QA_WEBKIT?{}:{args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const p=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:'+server.address().port);
  for(const a of manifest.assets){
   const m=await p.evaluate(async a=>{
    const im=new Image();im.src='/'+a.path;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);const rgba=x.getImageData(0,0,c.width,c.height).data;
    let partial=0;for(let i=3;i<rgba.length;i+=4)if(rgba[i]>0&&rgba[i]<240)partial++;
    const at=(xx,y)=>rgba[(y*c.width+xx)*4+3],corners=[[0,0],[c.width-1,0],[0,c.height-1],[c.width-1,c.height-1],[Math.floor(c.width/2),0]].map(([xx,y])=>at(xx,y));
    const composites=['#111111','#eeeeee'].map(color=>{x.clearRect(0,0,c.width,c.height);x.fillStyle=color;x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0);return [...x.getImageData(0,0,1,1).data];});
    return {size:[im.width,im.height],corners,center:at(Math.floor(c.width/2),Math.floor(c.height/2)),partial,composites};
   },a);
   assert.deepEqual(m.size,a.size);assert(m.corners.every(v=>v===0),a.name+' transparent exterior');assert(m.center>=240,a.name+' opaque subject');assert(m.partial>100,a.name+' antialiased edges');assert.deepEqual(m.composites,[[17,17,17,255],[238,238,238,255]],a.name+' untinted transparent corners');
  }
  const s=await p.evaluate(()=>{document.body.classList.add('lite','phase-crisis');const d=getComputedStyle(document.body,'::after'),e=document.createElement('div');e.className='evidence-view';document.body.append(e);return {danger:d.backgroundImage,events:d.pointerEvents,grain:getComputedStyle(document.documentElement).getPropertyValue('--grain'),evidence:getComputedStyle(e,'::after').content};});
  assert(s.danger.includes('radial-gradient')&&!s.danger.includes('url('));assert.equal(s.events,'none');assert(!s.grain.includes('feTurbulence'));assert.equal(s.evidence,'none');assert.deepEqual(errors,[]);
  console.log(`Clean UI: five assets decoded, hashes/dimensions/alpha/dark-light corners checked; ${oldBytes} -> ${newBytes} bytes; CSS noise removed`);
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
