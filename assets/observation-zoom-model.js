/* Transforms photo-native coordinates for optional 2x inspection.
 * No game state, reward or scene selection is modified. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.WatchZoom=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 function rect(width,height,zoom=1){
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)return null;
  const z=zoom===2?2:1,baseWidth=Math.min(width,height*2),baseHeight=baseWidth/2;
  return {left:(width-baseWidth*z)/2,top:(height-baseHeight*z)/2,width:baseWidth*z,height:baseHeight*z};
 }
 function point(x,y,width,height,zoom=1){
  if(!Number.isFinite(x)||!Number.isFinite(y))return null;
  const r=rect(width,height,zoom);
  if(!r||x<Math.max(0,r.left)||x>Math.min(width,r.left+r.width)||
    y<Math.max(0,r.top)||y>Math.min(height,r.top+r.height))return null;
  return {x:(x-r.left)/r.width,y:(y-r.top)/r.height};
 }
 return {rect,point};
});