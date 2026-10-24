// Explicit development browser benchmark. Never invoked by installed hooks.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {startLab} from '../labs/server.mjs';
const args=process.argv.slice(2), option=k=>args[args.indexOf(k)+1];
const output=path.resolve(args.includes('--output')?option('--output'):'validation/private/lab-results.json');
const samples=Number(args.includes('--samples')?option('--samples'):5);
assert.ok(Number.isInteger(samples)&&samples>=3&&samples<=20);
const lab=await startLab();let browser;
const runs=[];
try{
 browser=await chromium.launch({channel:'chromium',headless:true,ignoreDefaultArgs:['--disable-back-forward-cache']});
 for(const scenario of ['loading','assets','interaction'])for(let i=0;i<samples;i++)for(const variant of i%2?['improved','baseline']:['baseline','improved']){
  const context=await browser.newContext({viewport:{width:1000,height:800},deviceScaleFactor:1});
  const page=await context.newPage();
  await page.goto(`${lab.url}/lab?variant=${variant}&case=${scenario}`);
  await page.waitForFunction(()=>window.lab?.state.marks.primary);
  if(scenario==='assets')await page.waitForFunction(()=>window.lab?.state.marks.imageDecoded);
  if(scenario==='interaction'){
   await page.waitForFunction(()=>window.lab.state.marks.optional);
   await page.locator('#action').click();
   await page.waitForFunction(()=>window.lab.state.marks.done&&window.lab.state.marks.acknowledgmentProxy);
   // Let the observer deliver the completed main-thread task.
   await page.evaluate(()=>new Promise(resolve=>setTimeout(resolve,60)));
  }
  const result=await page.evaluate(()=>{
   const s=window.lab.snapshot(),m=s.marks;
   return {primaryMs:m.primary,acknowledgmentProxyMs:m.acknowledgmentProxy-m.tap,completionMs:m.done-m.tap,completedJobs:s.completedJobs,
    maxInteractionLongTaskMs:Math.max(0,...s.longTasks.filter(t=>t.start>=m.tap-1).map(t=>t.duration)),
    imageBytes:performance.getEntriesByType('resource').filter(r=>r.name.includes('/generated/')).reduce((n,r)=>n+r.encodedBodySize,0),
    primary:document.querySelector('#primary').textContent,shell:!!document.querySelector('#shell')};
  });
  assert.equal(result.primary,'Primary content ready');assert.equal(result.shell,true);
  if(scenario==='interaction')assert.equal(result.completedJobs,120);
  if(scenario==='assets')assert.ok(result.imageBytes>0);
  runs.push({scenario,variant,iteration:i,...result});await context.close();
 }
 const context=await browser.newContext(),page=await context.newPage();
 await page.goto(lab.url+'/lab?variant=improved&fail=1');
 await page.waitForFunction(()=>window.lab?.state.marks.optionalError);
 assert.equal(await page.locator('#primary').textContent(),'Primary content ready');
 assert.equal(await page.locator('#optional').textContent(),'Optional failed');
 // A real history navigation, explicitly reporting whether bfcache was used.
 await page.evaluate(()=>localStorage.setItem('fixtureScope','a'));
 await page.goto(lab.url+'/history');await page.waitForFunction(()=>window.historyLab?.settled);
 assert.equal(await page.locator('#private').textContent(),'Authorized fixture scope a');
 const diagnostics=[];const cdp=await context.newCDPSession(page);await cdp.send('Page.enable');cdp.on('Page.backForwardCacheNotUsed',e=>diagnostics.push(e.notRestoredExplanations.map(r=>r.reason)));
 await page.locator('a').click();
 const other=await context.newPage();await other.goto(lab.url+'/health');await other.evaluate(()=>localStorage.setItem('fixtureScope','b'));
 await page.evaluate(()=>history.back());await page.waitForFunction(()=>window.historyLab?.settled&&window.historyLab.scope==='b');
 const history=await page.evaluate(()=>({persisted:window.historyLab.events.some(e=>e.persisted),snapshotMasked:window.historyLab.events.some(e=>e.type==='pagehide'&&e.masked),scope:window.historyLab.scope,text:document.querySelector('#private').textContent}));
 history.notRestoredReasons=diagnostics;
 assert.equal(history.persisted,true,'Real bfcache restoration was not exercised');assert.equal(history.snapshotMasked,true);assert.equal(history.text,'Authorized fixture scope b');assert.equal(await page.locator('#private').isVisible(),true);await context.close();
 const stats=values=>{const v=values.sort((a,b)=>a-b);return {median:v[Math.floor(v.length/2)],min:v[0],max:v.at(-1)}};
 const metrics={loading:'primaryMs',assets:'imageBytes',interaction:'acknowledgmentProxyMs'};
 const summary=Object.entries(metrics).map(([scenario,metric])=>{
  const baseline=stats(runs.filter(r=>r.scenario===scenario&&r.variant==='baseline').map(r=>r[metric]));
  const improved=stats(runs.filter(r=>r.scenario===scenario&&r.variant==='improved').map(r=>r[metric]));
  return {scenario,metric,baseline,improved,medianReductionPercent:(baseline.median-improved.median)/baseline.median*100};
 });
 const budgets=JSON.parse(fs.readFileSync(new URL('../labs/budgets.json',import.meta.url)));
 const checks=summary.map(s=>({scenario:s.scenario,metric:s.metric,actual:s.improved.median,maximum:budgets[s.scenario].maximum,passed:s.improved.median<=budgets[s.scenario].maximum}));
 const report={version:'0.2.0',node:process.version,platform:process.platform,browser:browser.version(),samplesPerVariant:samples,
  conditions:'Local loopback, Chromium headless, 1000x800 CSS px, DPR 1, fresh context per trial, interleaved order, no network/CPU emulation. Delays and CPU workload are controlled synthetic fixture inputs.',
  attribution:'Hand-authored reference variants implementing documented patterns. This is not an agent-generated implementation experiment or a universal plugin effect estimate.',
  metrics:'primaryMs: navigation-to-primary DOM update, not LCP. acknowledgmentProxyMs: click-handler start to a double-frame callback, not field INP. imageBytes: encoded image response bodies.',
  summary,checks,history,correctness:{optionalFailurePreservesPrimary:true,bothVariantsComplete120Jobs:true,bothVariantsRetainShell:true,scopeRevalidatedAfterRealHistoryNavigation:true},runs};
 fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
 for(const s of summary)console.log(`${s.scenario}: baseline ${s.baseline.median.toFixed(2)}, improved ${s.improved.median.toFixed(2)} ${s.metric}`);
 console.log('Real history navigation used bfcache:',history.persisted);console.log('Report:',output);
 if(args.includes('--assert-budgets'))assert.ok(checks.every(c=>c.passed),'An explicit synthetic lab budget failed; inspect the report.');
}finally{await browser?.close();await lab.close();}
