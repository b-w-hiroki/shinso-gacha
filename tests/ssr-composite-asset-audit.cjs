/* Release-gate the exact SSR composites against their separately retained
 * CC0 photo masters, photographic deltas and authored SVG hotspot art.
 * This validates pixel provenance and 1440x720 dimensions, not human fear. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'assets/observation');
assert.match(fs.readFileSync(path.join(root,'.gitattributes'),'utf8'),/^assets\/observation\/alt-overlays\/\*\.svg -text$/m,'SVG masters must retain byte-identical line endings on every checkout');
const json=JSON.parse(fs.readFileSync(path.join(root,'docs/qa-incursions/ssr-composite-build.json'),'utf8'));
const Location=require('../assets/observation-location-model');
const expected=['cctv','photo','vision','dash'];
const sha=buf=>crypto.createHash('sha256').update(buf).digest('hex');
function size(buf){
 assert(buf.length>30&&buf.toString('ascii',0,4)==='RIFF'&&buf.toString('ascii',8,12)==='WEBP','invalid WebP');
 for(let at=12;at+8<=buf.length;){
  const type=buf.toString('ascii',at,at+4),n=buf.readUInt32LE(at+4),i=at+8;
  assert(i+n<=buf.length,'truncated WebP chunk');
  if(type==='VP8X')return [1+buf.readUIntLE(i+4,3),1+buf.readUIntLE(i+7,3)];
  if(type==='VP8 '){
   assert(buf[i+3]===0x9d&&buf[i+4]===0x01&&buf[i+5]===0x2a,'invalid WebP keyframe');
   return [buf.readUInt16LE(i+6)&0x3fff,buf.readUInt16LE(i+8)&0x3fff];
  }
  at=i+n+(n%2);
 }
 throw Error('unsupported WebP variant');
}
assert.equal(json.version,1);
assert.deepEqual(json.size,[1440,720]);
assert.deepEqual(json.entries.map(x=>x.mode),expected,'four fixed SSR sources, no missing or extra composites');
const seen=new Set();
for(const row of json.entries){
 const mode=row.mode,scene=Location.byId('alt:'+mode);
 assert(scene,'unknown composite mode');
 assert.equal(row.source,scene.file);
 assert.equal(row.output,mode+'-3.webp');
 assert.equal(Location.ssrComposite(mode),'assets/observation/ssr-composites/'+row.output);
 for(const [file,hash] of [
  [path.join(dir,row.source),row.photo_sha256],
  [path.join(dir,'photo-deltas',mode+'-3.webp'),row.delta_sha256],
  [path.join(dir,'alt-overlays',mode+'-3.svg'),row.clue_sha256]
 ]){
  assert.equal(sha(fs.readFileSync(file)),hash,'a source changed without regenerating SSR composite: '+file);
 }
 const buf=fs.readFileSync(path.join(dir,'ssr-composites',row.output));
 assert.deepEqual(size(buf),[1440,720],mode+' SSR art must stay native 2:1');
 assert.equal(buf.length,row.bytes);
 assert.equal(sha(buf),row.output_sha256,'stale/modified precomposed pixels: '+mode);
 assert(!seen.has(row.output_sha256),'different sources require different compositions');
 seen.add(row.output_sha256);
}
assert.equal(Location.ssrComposite('__proto__'),null);
console.log('Four original-photo + WebP-delta + SVG masters and derived SSR composites: exact hashes, dimensions and stable paths verified');
