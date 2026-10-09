/* Fit the illustrated scene using actual header/status/nav geometry, including Safari resizing. */
function fitGacha(){
 const scene=document.querySelector('.gacha-scene');if(scene.hidden)return;
 const envelope=document.getElementById('big-env'),actions=scene.querySelector('.pulls'),nav=document.querySelector('.nav');
 const navHeight=nav.getBoundingClientRect().height;
 document.documentElement.style.setProperty('--scene-nav-height',`${navHeight}px`);
 const bottom=actions.getBoundingClientRect().bottom+scrollY;
 const room=innerHeight-navHeight-bottom-12;
 const current=envelope.getBoundingClientRect().height;
 const width=scene.querySelector('.cabinet').clientWidth;
 const height=Math.max(90,Math.min(width*.72,400,current+room));
 if(Math.abs(height-current)>1)envelope.style.setProperty('--envelope-height',`${Math.floor(height)}px`);
}
addEventListener('resize',fitGacha);window.visualViewport?.addEventListener('resize',fitGacha);
new ResizeObserver(()=>requestAnimationFrame(fitGacha)).observe(document.querySelector('.gacha-scene'));
new ResizeObserver(()=>requestAnimationFrame(fitGacha)).observe(document.querySelector('.top'));

// Prevent unintended zoom only on game controls. Reading text still permits browser zoom.
const GAME_TOUCH_SURFACES='button,.thread-radar,.gacha-scene,.st-env,#obs-frame,.inc-photo,.inc-presence';
document.addEventListener('touchstart',e=>{
 if(e.touches.length>1&&[...e.touches].some(t=>t.target instanceof Element&&t.target.closest(GAME_TOUCH_SURFACES)))e.preventDefault();
},{passive:false});
document.addEventListener('gesturestart',e=>{if(e.target instanceof Element&&e.target.closest(GAME_TOUCH_SURFACES))e.preventDefault();},{passive:false});
