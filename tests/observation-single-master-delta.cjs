/* Single-master observation pilot: validate 4 canonical photos × 3 sparse deltas.
 * This is a geometry/provenance contract, not proof of perceptual quality.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const WatchLocations=require('../assets/observation-location-model.js');
const root=path.resolve(__dirname,'..'),modes=['cctv','photo','vision','dash'];
const sources=JSON.parse(fs.readFileSync(path.join(root,'docs/observation-native-sources.json'),'utf8'));
const out=[];
for(const mode of modes){
 const scene=WatchLocations.byId('alt:'+mode);
 const master=sources.sources.find(s=>s.mode===mode);
 assert(scene&&master&&scene.file===master.file,'scene must reuse registered source master: '+mode);
 assert(fs.existsSync(path.join(root,'assets/observation',scene.file)),'master missing: '+mode);
 for(const rarity of [1,2,3]){
  const file=path.join(root,'assets/observation/alt-overlays',mode+'-'+rarity+'.svg');
  const delta=fs.readFileSync(file,'utf8');
  assert.match(delta,/<svg\b/,'missing SVG delta');
  assert.match(delta,/viewBox="0 0 1000 1000"/,'delta coordinate space changed');
  assert(!/<(?:image|foreignObject|script|text)\b/i.test(delta),'delta must not embed another full-frame photo, executable script or text');
  assert(!/\b(?:onload|onclick|onerror)\s*=/i.test(delta),'event handlers not allowed in delta');
  const found=delta.match(/\bdata-hotspots="([^"]+)"/);
  assert(found,'delta needs authored hotspots: '+mode+':'+rarity);
  const points=found[1].split(';').map(item=>item.split(',').map(Number));
  const expected=WatchLocations.targets(mode,rarity);
  assert(expected&&points.length===expected.length,'hotspot count differs from runtime targets: '+mode+':'+rarity);
  for(let i=0;i<points.length;i++){
   assert(points[i].length===2&&points[i].every(Number.isFinite),'invalid SVG hotspot');
   const [x,y]=points[i],target=expected[i];
   assert(x>=0&&x<=1000&&y>=0&&y<=1000,'hotspot outside canonical source');
   assert(Math.abs(x/1000-target[0])<0.001&&Math.abs(y/1000-target[1])<0.001,
    'art hotspot drift from actual in-game touch region: '+mode+':'+rarity+':'+i);
  }
  out.push({mode,rarity,master:scene.file,delta:path.basename(file),hotspots:points.length});
 }
}
assert.equal(out.length,12,'4 site masters must have 3 state deltas each');
console.log('Single-source four-site/12-delta contract passed; this does not certify visibility or discoverability.');
console.log(JSON.stringify(out,null,2));
