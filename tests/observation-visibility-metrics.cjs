/* Compare 390x844 screenshots globally AND at each authored image-space hotspot.
 * These are pixel statistics, not perceptual/discoverability success criteria.
 * Requires Chromium Playwright and the four-site browser QA screenshots. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const WatchLocations=require('../assets/observation-location-model.js');

(async()=>{
 const folder=path.join(__dirname,'..','docs','qa-incursions');
 const modes=['cctv','photo','vision','dash'];
 const roi={left:14,top:285,right:376,bottom:474};
 const hotspotMap=Object.fromEntries(modes.map(mode=>[
  mode,Object.fromEntries([1,2,3].map(r=>[r,WatchLocations.targets(mode,r)]))
 ]));
 const names=modes.flatMap(mode=>[
  'alt-'+mode+'-native-normal-390.jpg',
  ...[1,2,3].map(r=>'alt-'+mode+'-'+r+'-390.jpg')
 ]);
 for(const name of names)assert(fs.existsSync(path.join(folder,name)),'missing browser photo: '+name);
 const browser=await chromium.launch({
  executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,
  args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']
 });
 try{
  const page=await browser.newPage();
  const encoded=Object.fromEntries(names.map(name=>[
   name,fs.readFileSync(path.join(folder,name)).toString('base64')
  ]));
  const data=await page.evaluate(async({files,roi,hotspotMap})=>{
   const width=roi.right-roi.left,height=roi.bottom-roi.top,samples={};
   for(const [name,base64] of Object.entries(files)){
    const img=new Image();img.src='data:image/jpeg;base64,'+base64;await img.decode();
    if(img.naturalWidth!==390||img.naturalHeight!==844)throw Error(name+': unexpected screenshot resolution');
    const canvas=document.createElement('canvas');canvas.width=390;canvas.height=844;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
    samples[name]=ctx.getImageData(roi.left,roi.top,width,height).data;
   }
   function difference(a,b,i){
    return (Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]))/3;
   }
   const rounded=x=>Math.round(x*10000)/10000;
   function compare(a,b){
    let changed=0,diff=0,lumaA=0,lumaB=0;const count=a.length/4;
    for(let i=0;i<a.length;i+=4){
     const d=difference(a,b,i);diff+=d;if(d>25)changed++;
     lumaA+=.2126*a[i]+.7152*a[i+1]+.0722*a[i+2];
     lumaB+=.2126*b[i]+.7152*b[i+1]+.0722*b[i+2];
    }
    return {pixels:count,changed_fraction_gt25:rounded(changed/count),
     mean_abs_rgb:Math.round(diff/count*100)/100,
     normal_mean_luma:Math.round(lumaA/count*100)/100,
     anomaly_mean_luma:Math.round(lumaB/count*100)/100};
   }
   function compareHotspot(a,b,source){
    const [x,y,rx,ry]=source;
    if(!source||source.length!==4||!source.every(Number.isFinite)||rx<=0||ry<=0)throw Error('invalid authored hotspot');
    const minX=Math.max(0,Math.floor((x-rx)*width)),maxX=Math.min(width,Math.ceil((x+rx)*width));
    const minY=Math.max(0,Math.floor((y-ry)*height)),maxY=Math.min(height,Math.ceil((y+ry)*height));
    let changed=0,diff=0,count=0;
    for(let row=minY;row<maxY;row++)for(let col=minX;col<maxX;col++){
     const dx=((col+.5)/width-x)/rx,dy=((row+.5)/height-y)/ry;
     if(dx*dx+dy*dy>1)continue;
     const i=(row*width+col)*4,d=difference(a,b,i);
     count++;diff+=d;if(d>25)changed++;
    }
    if(!count)throw Error('authored hotspot is outside the observed screenshot');
    return {center:[x,y],radius:[rx,ry],pixels:count,
     changed_fraction_gt25:rounded(changed/count),
     mean_abs_rgb:Math.round(diff/count*100)/100};
   }
   const results=[];
   for(const mode of ['cctv','photo','vision','dash']){
    const normal=samples['alt-'+mode+'-native-normal-390.jpg'];
    const blank=compare(normal,normal);
    if(blank.changed_fraction_gt25!==0||blank.mean_abs_rgb!==0)throw Error('global negative control failed: '+mode);
    for(const rarity of [1,2,3]){
     const anomaly=samples['alt-'+mode+'-'+rarity+'-390.jpg'],targets=hotspotMap[mode][rarity];
     if(!targets?.length)throw Error('no authored hotspots '+mode+'/'+rarity);
     const hotspot_metrics=targets.map(t=>compareHotspot(normal,anomaly,t));
     for(const t of targets){
      const blankHotspot=compareHotspot(normal,normal,t);
      if(blankHotspot.changed_fraction_gt25!==0||blankHotspot.mean_abs_rgb!==0)
       throw Error('local negative control failed: '+mode+'/'+rarity);
     }
     results.push({mode,rarity,...compare(normal,anomaly),
      hotspot_metrics,
      hotspot_max_changed_fraction_gt25:Math.max(...hotspot_metrics.map(x=>x.changed_fraction_gt25))});
    }
   }
   return results;
  },{files:encoded,roi,hotspotMap});
  assert.equal(data.length,12);
  for(const row of data){
   assert(Number.isFinite(row.mean_abs_rgb)&&row.changed_fraction_gt25>=0&&row.changed_fraction_gt25<=1);
   assert.equal(row.hotspot_metrics.length,hotspotMap[row.mode][row.rarity].length);
   for(const h of row.hotspot_metrics){
    assert(h.pixels>0&&h.changed_fraction_gt25>=0&&h.changed_fraction_gt25<=1&&Number.isFinite(h.mean_abs_rgb));
   }
  }
  const report={
   kind:'rendered_screenshot_diagnostic_not_perceptual_quality',
   captured_main_sha:process.env.GITHUB_SHA||null,
   source:'tests/observation-location-variants.cjs 390x844 JPEG screenshots',
   roi,threshold_mean_rgb:25,
   hotspot_roi_basis:'native authored hotspot ellipses projected onto 390x844 photo ROI, clipped to visible screenshot',
   interpreted_as_discoverability:false,
   interpreted_as_horror_score:false,
   human_search_time_seconds:null,user_perceived_readability:null,
   comparisons:data
  };
  fs.writeFileSync(path.join(folder,'observation-visibility-metrics.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
