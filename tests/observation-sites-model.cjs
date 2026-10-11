const assert=require('node:assert/strict'),M=require('../assets/observation-sites-model');
assert.equal(M.site('cctv',0),'cctv:main');assert.equal(M.site('cctv',1),'cctv:alt');assert.equal(M.site('cctv',2),'cctv:main');
assert.equal(M.site('invalid',1),null);assert.equal(M.site('photo',-1),null);
let state=M.read(null);
assert.equal(M.owned(state,'cctv','alt'),false);assert.equal(M.count(state,'cctv','alt',2),0);
let first=M.register(state,{mode:'cctv',sequence:1,rarity:0});assert(first.changed);state=first.state;
assert.equal(M.count(state,'cctv','alt',0),1);assert.equal(M.count(state,'cctv','main',0),0);
assert.equal(M.register(state,{mode:'cctv',sequence:1,rarity:0}).changed,false,'same claimed frame idempotent');
state=M.register(state,{mode:'cctv',sequence:2,rarity:2}).state;
state=M.register(state,{mode:'photo',sequence:1,rarity:3}).state;
assert(M.owned(state,'cctv','main'));assert(M.owned(state,'photo','alt'));
assert.equal(M.read(JSON.parse(JSON.stringify(state))).counts['photo:alt:3'],1);
assert.equal(M.read({counts:{'unknown:alt:2':3,'cctv:alt:1':4,'__proto__':8},seen:[]}).counts['unknown:alt:2'],undefined);
assert.equal(M.overlay('photo',3),'assets/observation/alt-overlays/photo-3.svg');assert.equal(M.overlay('dash',0),null);
for(const [mode,item]of Object.entries(M.LOCATIONS)){assert(item.alt.name&&item.alt.image&&item.alt.notes.length===4);for(let r=1;r<=3;r++)assert(M.overlay(mode,r));}
console.log('Eight-location identity, alt collection, stable archive, idempotence and safe migration passed');