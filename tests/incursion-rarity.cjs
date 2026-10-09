const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync('assets/incursions.js','utf8');
let seed=1;const math=Object.create(Math);math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const c=vm.createContext({S:{},Math:math,document:{addEventListener(){}}});vm.runInContext(source,c);
const run=s=>vm.runInContext(s,c),plain=x=>JSON.parse(JSON.stringify(x));
assert.deepEqual(plain(run('INC_RARITIES.map(r=>[r.id,r.weight,r.cases.length])')),[['N',60,50],['R',28,30],['SR',10,15],['SSR',2,5]]);
assert.deepEqual(plain(run('INC_RARITIES.flatMap(r=>r.cases).sort((a,b)=>a-b)')),Array.from({length:100},(_,i)=>i),'All 100 cases occur in exactly one rarity');
const random=math.random;
for(const [roll,expected] of [[0,'N'],[.599999,'N'],[.6,'R'],[.879999,'R'],[.88,'SR'],[.979999,'SR'],[.98,'SSR'],[.999999,'SSR']]){
 let n=0;math.random=()=>n++===0?roll:.5;
 assert.equal(run('incursionRarity(drawIncursionKind({})).id'),expected,'Exact probability boundary '+roll);
}
// Every candidate in every rarity is reachable through equal sized intervals.
for(const [index,roll] of [[0,.1],[1,.7],[2,.9],[3,.99]]){
 const ids=plain(run(`INC_RARITIES[${index}].cases`));
 for(let j=0;j<ids.length;j++){let n=0;math.random=()=>n++===0?roll:(j+.5)/ids.length;assert.equal(run('drawIncursionKind({})'),ids[j]);}
 // Excluding one preceding case keeps the selected rarity and reaches all others.
 const previous=ids[0];c.previous=previous;
 for(let j=0;j<ids.length-1;j++){let n=0;math.random=()=>n++===0?roll:(j+.5)/(ids.length-1);assert.equal(run('drawIncursionKind({history:[{kind:previous}]})'),ids[j+1]);}
}
math.random=random;
run('S.incursion={version:1,level:0,resolved:0,history:[]};');
const counts={N:0,R:0,SR:0,SSR:0};let previous=-1;
for(let i=0;i<20000;i++){
 const e=run('(()=>{const a=incursionState();const e=incursionEvent(a);a.resolved++;a.history=[{kind:e.kind}];return {kind:e.kind,rarity:incursionRarity(e.kind).id};})()');
 assert.notEqual(e.kind,previous);previous=e.kind;counts[e.rarity]++;
}
for(const [r,rate] of [['N',.6],['R',.28],['SR',.1],['SSR',.02]])assert(Math.abs(counts[r]/20000-rate)<.015,'Seeded frequency stays near configured rate '+r);
run('S.incursion={version:1,level:40,resolved:3,manual:3,deck:[1,2,3],history:[{kind:2}],event:{kind:6,tier:1,step:1,seen:0,round:0,contacts:2}};incursionState();');
const snapshot=JSON.stringify(c.S.incursion);
assert.equal(run('incursionEvent(incursionState()).kind'),6,'Active event never rerolls');
run('S.incursion=JSON.parse('+JSON.stringify(snapshot)+');incursionState();');
assert.equal(c.S.incursion.event.contacts,2);assert.equal(c.S.incursion.event.kind,6);assert.equal(c.S.incursion.deck,undefined);
console.log('Rarity boundaries, 100 unique assignments, equal candidate intervals, no immediate repeats, 20k seeded draws and save compatibility passed',counts);
