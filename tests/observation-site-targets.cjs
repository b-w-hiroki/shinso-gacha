const assert=require('node:assert/strict');
const Model=require('../assets/observation-model.js');
const Sites=require('../assets/observation-location-model.js');
const T=1800000000000;
const savedGlobal=globalThis.WatchLocations;
try {
 globalThis.WatchLocations=Sites;
 assert.equal(Sites.targets('cctv',0),null);
 assert.equal(Sites.targets('constructor',1),null);
 for(const mode of ['cctv','photo','vision','dash']){
  for(const rarity of [1,2,3]){
   const coords=Sites.targets(mode,rarity);
   assert(Array.isArray(coords)&&coords.length===Model.TARGETS[mode][rarity].length);
   assert.notStrictEqual(coords,Model.TARGETS[mode][rarity],'new location targets have separate ownership');
   const state=Model.create(T,42);
   state.mode=mode;state.mind.closed=false;
   state.pending={mode,rarity,sequence:1,readyAt:T,expiresAt:T+3*Model.HOUR,suppression:0};
   assert.strictEqual(Model.activeTargets(state),coords,'odd sequence resolves site-specific geometry');
   for(const [x,y] of coords)assert(Model.hit(state,{x,y}),'every illustrated center is clickable');
   assert(!Model.hit(state,{x:-.01,y:.3}));assert(!Model.hit(state,{x:.51,y:1.1}));
   const [x,y]=coords[0];
   const region=Math.floor(y*3)*3+Math.floor(x*3);
   assert.equal(Model.suppressRegion(state,T,region),null);
   assert.equal(state.pending.suppression,1,'accessible picker uses new location contact area');
   state.pending.suppression=0;
   for(let i=0;i<Model.SUPPRESS[rarity]-1;i++)assert.equal(Model.suppress(state,T,{x,y}),null);
   const result=Model.suppress(state,T,{x,y});
   assert.equal(result.kind,'anomaly');assert.equal(result.record.mode,mode);
   assert.equal(state.collection[mode+':'+rarity],1,'existing earned ID does not change');
   assert.equal(Sites.observe(state,result.record),true,'new location uses its separate acquired ID');
   assert.equal(Sites.discovered(state.locationRecords)[0].id,'alt:'+mode);
   const restored=Model.normalize(JSON.parse(JSON.stringify(state)));
   assert.equal(restored.collection[mode+':'+rarity],1,'save round trip preserves legacy ID');
   assert.equal(Sites.discovered(restored.locationRecords)[0].rarities[rarity],1);
   // Even sequence still obeys the untouched original artwork's coordinates.
   const original=Model.create(T,42);
   original.mode=mode;original.pending={mode,rarity,sequence:2,readyAt:T,expiresAt:T+3*Model.HOUR,suppression:0};
   assert.strictEqual(Model.activeTargets(original),Model.TARGETS[mode][rarity]);
   const fresh=Model.create(T,42);fresh.mode=mode;fresh.pending={mode,rarity,sequence:1,readyAt:T,expiresAt:T+3*Model.HOUR,suppression:0};
   assert.equal(Model.hit(fresh,{x:coords[0][0],y:coords[0][1]}),true,'pending observation is same before/after reload');
  }
 }
 const alt=Model.create(T,99);alt.mode='cctv';
 alt.pending={mode:'cctv',rarity:1,sequence:1,readyAt:T,expiresAt:T+3*Model.HOUR,suppression:0};
 const center=Sites.targets('cctv',1)[0];
 assert.equal(Model.hit(alt,{x:center[0],y:center[1]+.21}),true,'site y radius is separately tuned');
 alt.pending.sequence=2;
 assert.equal(Model.hit(alt,{x:center[0],y:center[1]+.21}),false,'original site keeps original y radius');
 // Offline model operation without an injected site registry keeps compatibility.
 delete globalThis.WatchLocations;
 assert.strictEqual(Model.activeTargets(alt),Model.TARGETS.cctv[1]);
 console.log('12 site target sets: manual, region selection, old ID/record compatibility, reload and legacy fallback passed');
} finally {if(savedGlobal===undefined)delete globalThis.WatchLocations;else globalThis.WatchLocations=savedGlobal;}
