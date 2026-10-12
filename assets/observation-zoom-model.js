/* Native photograph inspection: every offset is relative to the source image,
 * not a new hotspot or saved game state. Pan is clamped to the image edges. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.WatchZoom=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 function limits(width,height,zoom=1){
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)return null;
  const z=zoom===2?2:1,baseWidth=Math.min(width,height*2),baseHeight=baseWidth/2;
  return {x:Math.max(0,(baseWidth*z-width)/2),y:Math.max(0,(baseHeight*z-height)/2)};
 }
 function clampPan(width,height,zoom=1,panX=0,panY=0){
  const l=limits(width,height,zoom);
  if(!l)return null;
  const safe=(n,v)=>Number.isFinite(v)?Math.min(n,Math.max(-n,v)):0;
  return {x:safe(l.x,panX),y:safe(l.y,panY)};
 }
 function rect(width,height,zoom=1,panX=0,panY=0){
  const pan=clampPan(width,height,zoom,panX,panY);
  if(!pan)return null;
  const z=zoom===2?2:1,baseWidth=Math.min(width,height*2),baseHeight=baseWidth/2;
  return {left:(width-baseWidth*z)/2+pan.x,top:(height-baseHeight*z)/2+pan.y,
    width:baseWidth*z,height:baseHeight*z};
 }
 function point(x,y,width,height,zoom=1,panX=0,panY=0){
  if(!Number.isFinite(x)||!Number.isFinite(y))return null;
  const r=rect(width,height,zoom,panX,panY);
  if(!r||x<Math.max(0,r.left)||x>Math.min(width,r.left+r.width)||
    y<Math.max(0,r.top)||y>Math.min(height,r.top+r.height))return null;
  return {x:(x-r.left)/r.width,y:(y-r.top)/r.height};
 }
 return {limits,clampPan,rect,point};
});