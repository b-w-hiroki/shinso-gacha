/* Audit the real binary images shipped to Pages. The legacy 320/480px files are
 * allowed during migration, but may not be described as high-resolution art. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const WatchLocations=require('../assets/observation-location-model.js');
const modes=['cctv','photo','vision','dash'];
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
const report=[];
for(const mode of modes){
 const scene=WatchLocations.byId('alt:'+mode);
 assert(scene&&scene.mode===mode,'missing site in location model: '+mode);
 const file=path.join(__dirname,'..','assets','observation',scene.file);
 const data=fs.readFileSync(file),[width,height]=dimensions(data);
 assert(width>=320&&height>=160,'site has invalid or unusable resolution: '+scene.file);
 assert(width/height>1.95&&width/height<2.05,'site must retain the existing 2:1 framing: '+scene.file);
 assert(data.length<=2*1024*1024,'unexpectedly large observation site: '+scene.file);
 const quality=width>=1200&&height>=600?'source-resolution-ready':'LOW_RES_SOURCE_REQUIRES_NEW_ART';
 report.push({id:scene.id,file:scene.file,width,height,bytes:data.length,quality});
}
assert(new Set(report.map(x=>x.file)).size===4,'sites should not share the same baseline photo');
console.log('Observation site image inventory (this is NOT a photorealism or in-game visual-quality test):');
console.log(JSON.stringify(report,null,2));
if(report.some(x=>x.quality==='LOW_RES_SOURCE_REQUIRES_NEW_ART'))
 console.warn('ART QUALITY OPEN: four shipped original scenes are still low-resolution. A 1440x720 replacement must be visually reviewed before closing Issue #81.');
