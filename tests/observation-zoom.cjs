const assert=require('node:assert/strict'),Zoom=require('../assets/observation-zoom-model.js');
for(const [w,h] of [[320,568],[390,320],[844,390],[390,148],[320,140]]){
 for(const zoom of [1,2]){
  const r=Zoom.rect(w,h,zoom);
  assert(r&&r.width>0&&r.height>0);
  const limits=Zoom.limits(w,h,zoom);
  assert(limits&&limits.x>=0&&limits.y>=0);
  for(const [panX,panY] of [[0,0],[-9999,-9999],[9999,9999],[45,-38]]){
   const bounded=Zoom.clampPan(w,h,zoom,panX,panY);
   assert(bounded&&Math.abs(bounded.x)<=limits.x&&Math.abs(bounded.y)<=limits.y);
   const frame=Zoom.rect(w,h,zoom,panX,panY);
   assert(Math.abs(frame.left-((w-frame.width)/2+bounded.x))<.001);
   assert(Math.abs(frame.top-((h-frame.height)/2+bounded.y))<.001);
   for(const [x,y] of [[.5,.5],[.4,.45],[.22,.65],[.76,.36]]){
    const px=frame.left+x*frame.width,py=frame.top+y*frame.height;
    if(px>=0&&px<=w&&py>=0&&py<=h){
     const q=Zoom.point(px,py,w,h,zoom,panX,panY);
     assert(q&&Math.abs(q.x-x)<1e-9&&Math.abs(q.y-y)<1e-9,
      'native frame point inverse must survive pan: '+JSON.stringify({w,h,zoom,panX,panY,x,y}));
    }
   }
  }
 }
}
assert.equal(Zoom.point(-5,-5,390,320,2),null);
assert.equal(Zoom.point(0,0,0,0,2),null);
assert.equal(Zoom.clampPan(0,150,2,100,100),null);
assert.deepEqual(Zoom.clampPan(390,200,1,100,100),{x:0,y:0},'1x image never pans');
assert.deepEqual(Zoom.clampPan(390,200,2,Infinity,NaN),{x:0,y:0},'non-finite offsets ignored');
assert(Zoom.limits(390,160,2).x>0,'source left and right reachable by panning');
assert(Zoom.limits(390,160,2).y>0,'source top and bottom reachable by panning');
console.log('1x/2x image viewport, pan clamp, native hotspots, and off-image rejection passed');