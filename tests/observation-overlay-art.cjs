const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const WatchModel=require('../assets/observation-model.js');
const WatchLocations=require('../assets/observation-location-model.js');
const seen=new Set(),marks=new Set();
for(const mode of ['cctv','photo','vision','dash']){
 for(const rarity of [1,2,3]){
  const file=path.join(__dirname,'..','assets','observation','alt-overlays',mode+'-'+rarity+'.svg');
  const svg=fs.readFileSync(file,'utf8'),match=svg.match(/data-hotspots="([^"]+)"/);
  assert(svg.includes('viewBox="0 0 1000 1000"'),file+': fixed normalized viewport');
  assert(svg.includes('preserveAspectRatio="none"'),file+': full image-space placement');
  assert(match,file+': declared illustrated hotspots');
  assert(!/<script\b|<text\b|<foreignObject\b/i.test(svg),'untrusted scripts or text labels should not be baked into art');
  const points=match[1].split(';').map(v=>v.split(',').map(Number));
  const targets=WatchModel.TARGETS[mode][rarity];
  assert.equal(points.length,targets.length,'all valid touch regions need a visible anomaly: '+file);
  for(let i=0;i<points.length;i++){
   assert(Math.abs(points[i][0]/1000-targets[i][0])<=.001,'wrong x hotspot '+file);
   assert(Math.abs(points[i][1]/1000-targets[i][1])<=.001,'wrong y hotspot '+file);
   assert(points[i].every(x=>Number.isFinite(x)&&x>=0&&x<=1000),'not a normalized coordinate');
  }
  assert.equal(WatchLocations.overlay(mode,rarity),'assets/observation/alt-overlays/'+mode+'-'+rarity+'.svg');
  const art=svg.replace(/<title>[^<]*<\/title>/,'').replace(/data-hotspots="[^"]*"/,'');
  assert(art.length>1050,'art layer is unexpectedly tiny '+file);
  assert(!seen.has(art),'site and rarity art should not be repeated');
  seen.add(art);marks.add(mode+rarity);
 }
}
assert.equal(seen.size,12);
assert.equal(marks.size,12);
console.log('Distinct observation art: 12 SVG variants; every visible anomaly center matches native image hit detection; no baked-in text');
