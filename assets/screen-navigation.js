/* Optional group navigation. Native Tab/Enter/Space remain available. */
document.addEventListener('keydown',e=>{
 if(e.defaultPrevented||e.isComposing||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)return;
 const keys=['ArrowLeft','ArrowRight','Home','End'];if(!keys.includes(e.key))return;
 const button=e.target.closest?.('[data-stab],[data-htab],[data-seg],[data-catalog-tab]');if(!button)return;
 const group=button.closest('[role="group"]');if(!group)return;
 const buttons=[...group.querySelectorAll('button')].filter(b=>!b.disabled&&b.getClientRects().length);
 const i=buttons.indexOf(button);if(i<0||buttons.length<2)return;
 const next=e.key==='Home'?buttons[0]:e.key==='End'?buttons.at(-1):buttons[(i+(e.key==='ArrowLeft'?-1:1)+buttons.length)%buttons.length];
 const attr=['data-stab','data-htab','data-seg','data-catalog-tab'].find(a=>next.hasAttribute(a)),value=next.getAttribute(attr);
 e.preventDefault();next.focus({preventScroll:true});next.click();
 // Catalog classification rebuilds its DOM; retain focus on the replacement button.
 if(!next.isConnected)document.querySelector(`[${attr}="${CSS.escape(value)}"]`)?.focus({preventScroll:true});
});
