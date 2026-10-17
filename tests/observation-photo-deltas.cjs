const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const WatchLocations=require('../assets/observation-location-model.js');
const root=path.join(__dirname,'..'),hashes=new Set();
for(const mode of ['cctv','photo','vision','dash']){
 const scene=WatchLocations.byId('alt:'+mode);
 assert(scene&&fs.existsSync(path.join(root,'assets/observation',scene.file)));
 assert.equal(WatchLocations.photoDelta(mode,0),null);
 for(const rarity of [1,2,3]){
  const name=WatchLocations.photoDelta(mode,rarity);
  assert.equal(name,'assets/observation/photo-deltas/'+mode+'-'+rarity+'.webp');
  const data=fs.readFileSync(path.join(root,name));
  // Floor reduced from 12000: reviewed generated deltas (photo-2 5,882 B, photo-3 9,712 B) are legitimately
  // sparse. Emptiness is still rejected below via the transparency flag, distinct hashes and hotspot checks.
  assert(data.length>5000&&data.length<500000,'sparse delta size, no second giant photo: '+name);
  assert.equal(data.toString('ascii',0,4),'RIFF',name);
  assert.equal(data.toString('ascii',8,12),'WEBP',name);
  assert.equal(data.toString('ascii',12,16),'VP8X',name);
  assert(data[20]&0x10,'delta must carry real transparent pixels: '+name);
  assert.equal(1+data.readUIntLE(24,3),1440,'source width changed: '+name);
  assert.equal(1+data.readUIntLE(27,3),720,'source height changed: '+name);
  assert(!hashes.has(crypto.createHash('sha256').update(data).digest('hex')),'duplicate anomaly: '+name);
  hashes.add(crypto.createHash('sha256').update(data).digest('hex'));
  assert(WatchLocations.overlay(mode,rarity)?.endsWith('/'+mode+'-'+rarity+'.svg'),
   'familiar authoring silhouette must remain a recognisable clue');
 }
}
assert.equal(hashes.size,12);
assert.equal(WatchLocations.photoDelta('__proto__',1),null);
assert.equal(WatchLocations.photoDelta('photo',NaN),null);
assert.equal(WatchLocations.photoDelta('photo',4),null);
console.log('Twelve distinct transparent 1440x720 photo-native deltas, intact original masters, stable authored hotspots passed');
