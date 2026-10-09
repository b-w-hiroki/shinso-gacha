// Exercise the public buttons for each shared grammar; do not mutate event progress.
async function compareEvidence(page){
 if(await page.locator('[data-inc="original"]').count()){
  await page.locator('[data-inc="original"]').click();await page.locator('[data-inc="current"]').click();
 }
}
async function finishWork(page){
 if(await page.locator('[data-inc="procedure"]').count())for(let i=0;i<3;i++)await page.locator(`[data-inc="procedure"][data-value="${i}"]`).click();
 if(await page.locator('[data-inc="wire"]').count())for(let i=0;i<2;i++)await page.locator(`[data-inc="wire"][data-value="${i}"]`).click();
 while(await page.locator('[data-inc="contact"]').count())await page.locator('[data-inc="contact"]').click();
}
module.exports={compareEvidence,finishWork};
