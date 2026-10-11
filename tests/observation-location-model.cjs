const assert=require('node:assert/strict'),L=require('../assets/observation-location-model');
const modes=['cctv','photo','vision','dash'];
for(const mode of modes){
 assert.equal(L.current(mode,0,0),null);
 assert.equal(L.current(mode,1,1)?.mode,mode,'odd-sequence anomalies stay in the same place');
 assert.equal(L.current(mode,0,1)?.mode,mode);
 assert.equal(L.current(mode,0,3)?.mode,mode);
}
assert.equal(L.current('__proto__',0,1),null);
assert.equal(L.current('cctv',0,-1),null);
assert.equal(L.current('cctv',0,1.5),null);
const state={collection:{'photo:0':3},currency:700,sequence:4};
assert.equal(L.observe(state,{mode:'photo',rarity:1,sequence:1,readyAt:1000}),true,'acquired anomaly also identifies a real place');
assert.equal(L.observe(state,{mode:'photo',rarity:0,sequence:1,readyAt:1000}),false,'same observation sequence cannot be recounted');
assert.equal(L.observe(state,{mode:'photo',rarity:0,sequence:1,readyAt:1000}),false,'no repeated collection');
assert.equal(L.observe(state,{mode:'photo',rarity:0,sequence:3,readyAt:2000}),true);
assert.deepEqual(state.locationRecords['alt:photo'],{visits:2,lastSequence:3,firstAt:1000,rarities:{0:1,1:1}});
assert.equal(state.currency,700);assert.equal(state.sequence,4);assert.equal(state.collection['photo:0'],3);
assert.deepEqual(L.discovered({}),[]);
assert.equal(L.discovered(state.locationRecords).length,1);
assert.equal(L.byId('alt:photo').title,'夜の教室');
assert.equal(L.byId('alt:dash').title,'海沿いの夜道');
assert.equal(L.byId('alt:foo'),null);
assert.deepEqual(L.normalize({'unknown':{visits:999},'alt:photo':{visits:2,lastSequence:3,firstAt:1000}}),{'alt:photo':{visits:2,lastSequence:3,firstAt:1000,rarities:{0:2}}},'old visits migrate as only normal recordings');
assert.equal(L.overlay('photo',2),'assets/observation/alt-overlays/photo-2.svg');
assert.equal(L.overlay('photo',0),null);
console.log('Location archive: acquired R/SR/SSR variants, no duplicate discovery, migrated visits, no reward or save corruption');