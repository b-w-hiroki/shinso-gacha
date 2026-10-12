const assert=require('node:assert/strict'),Zoom=require('../assets/observation-zoom-model.js');
for(const [w,h] of [[320,568],[390,320],[844,390],[390,844]]){
 for(const zoom of [1,2]){
  for(let panX=0;panX<=2;panX++)for(let panY=0;panY<=2;panY++){
   const rect=Zoom.rect(w,h,zoom,panX,panY);
   assert(rect&&rect.width>0&&rect.height>0);
   if(zoom===1)assert.deepEqual(rect,Zoom.rect(w,h,1),'1x must never pan');
   for(const [x,y] of [[.05,.05],[.5,.5],[.95,.95]]){
    const px=rect.left+x*rect.width,py=rect.top+y*rect.height;
    if(px>=0&&px<=w&&py>=0&&py<=h){
     const point=Zoom.point(px,py,w,h,zoom,panX,panY);
     assert(point&&Math.abs(point.x-x)<1e-9&&Math.abs(point.y-y)<1e-9,'pan projection '+w+'x'+h+':'+zoom+'/'+panX+'/'+panY);
    }
   }
  }
 }
}
const left=Zoom.rect(390,320,2,0,0),right=Zoom.rect(390,320,2,2,2);
assert(left.left>right.left&&left.top>right.top,'all regions can be inspected independently');
assert.equal(Zoom.point(-1,-5,390,320,2,0,0),null);
assert.equal(Zoom.point(0,0,0,0,2),null);
console.log('Observation 1x/2x native photo projection and 3x3 corner panning passed');
