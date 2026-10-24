import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
const plugin=fileURLToPath(new URL('../plugins/performance-engineering/',import.meta.url));
const root=fs.mkdtempSync(path.join(os.tmpdir(),'performance-bench-')),cwd=path.join(root,'project');fs.mkdirSync(cwd);fs.writeFileSync(path.join(cwd,'package.json'),'{}');
try{
 const times=[],emptyProcess=[];
 for(let i=0;i<45;i++){
  const emptyStart=performance.now();const empty=spawnSync(process.execPath,['-e',''],{encoding:'utf8'});if(empty.status!==0)throw Error('Node startup control failed');emptyProcess.push(performance.now()-emptyStart);
  const start=performance.now();const r=spawnSync(process.execPath,[path.join(plugin,'scripts/hook.mjs'),'codex'],{input:JSON.stringify({hook_event_name:'UserPromptSubmit',session_id:'bench-'+i,cwd,prompt:'Optimize slow N+1 queries and tenant caching.'}),encoding:'utf8',env:{...process.env,PLUGIN_DATA:path.join(root,'state')}});
  if(r.status!==0||!r.stdout)throw Error('Hook did not produce a valid benchmark response');times.push(performance.now()-start);
 }
 times.sort((a,b)=>a-b);emptyProcess.sort((a,b)=>a-b);console.log(JSON.stringify({node:process.version,platform:process.platform,samples:times.length,includesProcessStartup:true,medianMs:times[22],p95Ms:times[Math.ceil(times.length*.95)-1],maxMs:times.at(-1),targetP95Ms:100,emptyNodeProcess:{medianMs:emptyProcess[22],p95Ms:emptyProcess[Math.ceil(emptyProcess.length*.95)-1]},conditions:"Local process wall-clock measurements; empty Node controls expose host startup variability. These are separate distributions, not a causal overhead subtraction."},null,2));
}finally{fs.rmSync(root,{recursive:true,force:true});}
