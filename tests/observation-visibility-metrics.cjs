/* Measure rendered in-game observation differences without declaring
 * discoverability, horror, or art-quality scores. Needs Chromium Playwright
 * and the screenshots produced by observation-location-variants.cjs first.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');

(async () => {
  const folder = path.join(__dirname, '..', 'docs', 'qa-incursions');
  const modes = ['cctv', 'photo', 'vision', 'dash'];
  const roi = {left: 14, top: 285, right: 376, bottom: 474};
  const names = modes.flatMap(mode => [
    'alt-' + mode + '-native-normal-390.jpg',
    ...[1,2,3].map(r => 'alt-' + mode + '-' + r + '-390.jpg'),
  ]);
  for (const name of names) {
    assert.ok(fs.existsSync(path.join(folder, name)), 'missing real browser screenshot: ' + name);
  }
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--no-zygote', '--single-process'],
  });
  try {
    const page = await browser.newPage();
    const encoded = Object.fromEntries(names.map(name => [
      name, fs.readFileSync(path.join(folder, name)).toString('base64'),
    ]));
    const data = await page.evaluate(async ({files, roi}) => {
      const samples = {};
      for (const [name, base64] of Object.entries(files)) {
        const img = new Image();
        img.src = 'data:image/jpeg;base64,' + base64;
        await img.decode();
        if (img.naturalWidth !== 390 || img.naturalHeight !== 844) {
          throw new Error(name + ': expected real 390x844 capture');
        }
        const canvas = document.createElement('canvas');
        canvas.width = 390; canvas.height = 844;
        const ctx = canvas.getContext('2d', {willReadFrequently:true});
        ctx.drawImage(img,0,0);
        samples[name] = ctx.getImageData(roi.left,roi.top,roi.right-roi.left,roi.bottom-roi.top).data;
      }
      const compare = (a,b) => {
        let changed = 0, difference = 0, luminanceA = 0, luminanceB = 0;
        const n = a.length/4;
        for (let i=0;i<a.length;i+=4) {
          const diff = (Math.abs(a[i]-b[i]) + Math.abs(a[i+1]-b[i+1]) + Math.abs(a[i+2]-b[i+2]))/3;
          difference += diff;
          if (diff > 25) changed++;
          luminanceA += .2126*a[i] + .7152*a[i+1] + .0722*a[i+2];
          luminanceB += .2126*b[i] + .7152*b[i+1] + .0722*b[i+2];
        }
        return {
          pixels:n,
          changed_fraction_gt25:Math.round(changed/n*10000)/10000,
          mean_abs_rgb:Math.round(difference/n*100)/100,
          normal_mean_luma:Math.round(luminanceA/n*100)/100,
          anomaly_mean_luma:Math.round(luminanceB/n*100)/100,
        };
      };
      const results = [];
      for (const mode of ['cctv','photo','vision','dash']) {
        const normal = samples['alt-'+mode+'-native-normal-390.jpg'];
        const control = compare(normal,normal);
        if (control.changed_fraction_gt25 !== 0 || control.mean_abs_rgb !== 0) {
          throw new Error('identical-image negative control failed: ' + mode);
        }
        for (const rarity of [1,2,3]) {
          results.push({
            mode, rarity,
            ...compare(normal,samples['alt-'+mode+'-'+rarity+'-390.jpg']),
          });
        }
      }
      return results;
    }, {files:encoded, roi});
    assert.equal(data.length, 12);
    for (const d of data) {
      assert.ok(Number.isFinite(d.mean_abs_rgb) && Number.isFinite(d.changed_fraction_gt25));
      assert.ok(d.changed_fraction_gt25>=0 && d.changed_fraction_gt25<=1);
    }
    const report = {
      kind:'rendered_screenshot_diagnostic_not_perceptual_quality',
      captured_main_sha:process.env.GITHUB_SHA || null,
      source:'tests/observation-location-variants.cjs 390x844 JPEG screenshots',
      roi,
      threshold_mean_rgb:25,
      interpreted_as_discoverability:false,
      interpreted_as_horror_score:false,
      human_search_time_seconds:null,
      user_perceived_readability:null,
      comparisons:data,
    };
    const output = path.join(folder,'observation-visibility-metrics.json');
    fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify(report,null,2));
  } finally {
    await browser.close();
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
