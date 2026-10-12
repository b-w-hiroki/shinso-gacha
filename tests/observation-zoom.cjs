const assert=require('node:assert/strict'),Zoom=require('../assets/observation-zoom-model.js');
for(const [w,h] of [[320,568],[390,320],[844,390]]){
 for(const zoom of [1,2]){
  const r=Zoom.rect(w,h,zoom);assert(r&&r.width>0&&r.height>0);
  for(const [x,y] of [[.5,.5],[.4,.45],[.55,.6]]){
   const px=r.left+x*r.width,py=r.top+y*r.height;
   if(px>=0&&px<=w&&py>=0&&py<=h){const q=Zoom.point(px,py,w,h,zoom);assert(q&&Math.abs(q.x-x)<1e-9&&Math.abs(q.y-y)<1e-9);}
  }
 }
}
assert.equal(Zoom.point(-5,-5,390,320,2),null);
assert.equal(Zoom.point(0,0,0,0,2),null);
console.log('Observation 1x/2x native photo projection passed');
