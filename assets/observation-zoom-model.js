/* Native-image coordinates survive 1x/2x zoom and nine inspectable regions.
 * Frame-relative image pixels determine touches; rewards and saves are elsewhere. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WatchZoom=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>({
 rect(width,height,zoom=1,panX=1,panY=1){
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)return null;
  const z=zoom===2?2:1,baseWidth=Math.min(width,height*2),scaledWidth=baseWidth*z,scaledHeight=scaledWidth/2;
  const x=Number.isInteger(panX)?Math.max(0,Math.min(2,panX)):1;
  const y=Number.isInteger(panY)?Math.max(0,Math.min(2,panY)):1;
  const left=z===2&&scaledWidth>width?(width-scaledWidth)*x/2:(width-scaledWidth)/2;
  const top=z===2&&scaledHeight>height?(height-scaledHeight)*y/2:(height-scaledHeight)/2;
  return {left,top,width:scaledWidth,height:scaledHeight};
 },
 point(localX,localY,width,height,zoom=1,panX=1,panY=1){
  if(!Number.isFinite(localX)||!Number.isFinite(localY))return null;
  const r=this.rect(width,height,zoom,panX,panY);
  if(!r||localX<Math.max(0,r.left)||localX>Math.min(width,r.left+r.width)||
    localY<Math.max(0,r.top)||localY>Math.min(height,r.top+r.height))return null;
  return {x:(localX-r.left)/r.width,y:(localY-r.top)/r.height};
 }
}));