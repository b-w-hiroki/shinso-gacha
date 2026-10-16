const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const NAMES=['miwa','sakaki','shirose'];
function webpDimensions(file){
 const data=fs.readFileSync(file);
 assert.equal(data.toString('ascii',0,4),'RIFF',file+' missing RIFF');
 assert.equal(data.toString('ascii',8,12),'WEBP',file+' missing WEBP');
 const kind=data.toString('ascii',12,16);
 let width,height;
 if(kind==='VP8X'){
  width=1+data.readUIntLE(24,3);height=1+data.readUIntLE(27,3);
 }else if(kind==='VP8 '){
  assert.equal(data.readUIntLE(23,3)&0xffffff,0x2a019d,'invalid VP8 start code');
  width=data.readUInt16LE(26)&0x3fff;height=data.readUInt16LE(28)&0x3fff;
 }else if(kind==='VP8L'){
  const b0=data[21],b1=data[22],b2=data[23],b3=data[24];
  width=1+(((b1&0x3f)<<8)|b0);
  height=1+(((b3&0x0f)<<10)|(b2<<2)|((b1&0xc0)>>6));
 }else throw Error(file+' unsupported WebP codec '+kind);
 assert(width>=64&&height>=64&&width<=4096&&height<=4096,
  file+' implausible image dimensions '+width+'x'+height);
 return {width,height,bytes:data.length};
}
const result={};
for(const name of NAMES){
 const filename=path.join(ROOT,'assets','colleagues',name+'.webp');
 assert(fs.existsSync(filename),'missing colleague asset '+name);
 result[name]=webpDimensions(filename);
}
const all=Object.values(result);
assert(all.every(x=>x.width===all[0].width&&x.height===all[0].height),
 'colleague portraits must share consistent canvas dimensions');
const registry=fs.readFileSync(path.join(ROOT,'assets/witness-registry-model.js'),'utf8');
assert(registry.includes('Object.hasOwn(cases||{},id)'), 'unowned cases must not be revealed');
assert(registry.includes('compared!==true'), 'uncompared evidence must stay hidden');
const personnel=fs.readFileSync(path.join(ROOT,'assets/personnel-discrepancies-model.js'),'utf8');
for(const id of ['records','equipment','senior'])assert(personnel.includes("'"+id+"'"));
console.log('Colleague portraits and acquired-only witness gates: '+JSON.stringify(result));
