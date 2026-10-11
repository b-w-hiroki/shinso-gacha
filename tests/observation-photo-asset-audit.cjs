/* Audit the native-resolution WebP binaries, verified CC0 source metadata, and the build report. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const WatchLocations=require('../assets/observation-location-model.js');
const modes=['cctv','photo','vision','dash'];
const sourceManifest=JSON.parse(fs.readFileSync(path.join(__dirname,'..','docs','observation-native-sources.json'),'utf8'));
const report=JSON.parse(fs.readFileSync(path.join(__dirname,'..','docs','qa-incursions','native-photo-source-report.json'),'utf8'));
assert.equal(sourceManifest.sources.length,4);
assert.equal(report.length,4);
function dimensions(data){
 assert(data.length>30&&data.toString('ascii',0,4)==='RIFF'&&data.toString('ascii',8,12)==='WEBP','invalid WebP RIFF');
 for(let at=12;at+8<=data.length;){
  const type=data.toString('ascii',at,at+4),length=data.readUInt32LE(at+4),pos=at+8;
  assert(pos+length<=data.length,'truncated WebP chunk');
  if(type==='VP8 '){
   assert(length>=10&&data[pos+3]===0x9d&&data[pos+4]===0x01&&data[pos+5]===0x2a,'invalid VP8 key frame');
   return [data.readUInt16LE(pos+6)&0x3fff,data.readUInt16LE(pos+8)&0x3fff];
  }
  if(type==='VP8L'){
   assert(length>=5&&data[pos]===0x2f,'invalid VP8 lossless header');
   const x=data[pos+1],y=data[pos+2],z=data[pos+3],w=data[pos+4];
   return [1+x+((y&0x3f)<<8),1+((y&0xc0)>>6)+(z<<2)+((w&0x0f)<<10)];
  }
  if(type==='VP8X'){
   assert(length>=10,'invalid WebP extension');
   return [1+data.readUIntLE(pos+4,3),1+data.readUIntLE(pos+7,3)];
  }
  at=pos+length+(length%2);
 }
 throw Error('no decodable WebP image dimensions');
}
const result=[];
for(const mode of modes){
 const scene=WatchLocations.byId('alt:'+mode);
 assert(scene&&scene.mode===mode,'missing site in location model: '+mode);
 const file=path.join(__dirname,'..','assets','observation',scene.file);
 const data=fs.readFileSync(file),[width,height]=dimensions(data);
 assert(width===1440&&height===720,'native art must be 1440x720, not a resized legacy image: '+scene.file);
 assert(width/height>1.95&&width/height<2.05,'site must retain the existing 2:1 framing: '+scene.file);
 assert(data.length<=2*1024*1024,'unexpectedly large observation site: '+scene.file);
 const src=sourceManifest.sources.find(s=>s.mode===mode),provenance=report.find(r=>r.mode===mode);
 assert(src&&provenance&&src.file===scene.file&&provenance.output===scene.file);
 assert(src.license==='CC0-1.0'&&/^https:\/\/commons.wikimedia.org\/wiki\/File:/.test(src.source),'license proof required');
 assert(provenance.license==='CC0-1.0'&&provenance.source===src.source&&provenance.bytes===data.length);
 assert(provenance.sha256===crypto.createHash('sha256').update(data).digest('hex'),'source output does not match reviewed art manifest');
 result.push({id:scene.id,file:scene.file,width,height,bytes:data.length,source:src.source});
}
assert(new Set(result.map(x=>x.file)).size===4,'sites should not share the same baseline photo');
console.log('Observation site image inventory (this is NOT a photorealism or in-game visual-quality test):');
console.log(JSON.stringify(result,null,2));
console.log('Four 1440x720 images, original source licenses, and binary hash provenance verified. This does not certify perceived visual quality.');
