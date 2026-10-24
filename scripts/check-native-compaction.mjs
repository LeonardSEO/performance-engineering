// Explicit authenticated host check. Raw host events stay in git-ignored storage.
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import readline from 'node:readline';import {spawn} from 'node:child_process';import {fileURLToPath} from 'node:url';
const repo=fileURLToPath(new URL('../',import.meta.url)),plugin=path.join(repo,'plugins/performance-engineering');
const output=path.join(repo,'validation/private/compaction');fs.mkdirSync(output,{recursive:true});
const own=run=>run?.sourcePath?.includes('performance-engineering')&&run.sourcePath.endsWith('hooks/codex.json');
async function codex(){
 const cwd=fs.mkdtempSync(path.join(os.tmpdir(),'performance-compact-'));fs.writeFileSync(path.join(cwd,'package.json'),'{}');
 const child=spawn('codex',['app-server','-c','plugins.performance-engineering@performance-engineering.enabled=true'],{cwd,stdio:['pipe','pipe','pipe']});
 let next=0;const pending=new Map(),events=[];let stderr='';child.stderr.on('data',d=>stderr+=d);
 const rpc=(method,params)=>new Promise((resolve,reject)=>{const id=++next;const timer=setTimeout(()=>{pending.delete(id);reject(Error('RPC timeout: '+method));},60000);pending.set(id,e=>{clearTimeout(timer);e.error?reject(Error(JSON.stringify(e.error))):resolve(e.result)});child.stdin.write(JSON.stringify({id,method,params})+'\n');});
 const wait=predicate=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>{clearInterval(poll);reject(Error('Host event timeout'));},120000);let cursor=events.length;const poll=setInterval(()=>{for(;cursor<events.length;cursor++)if(predicate(events[cursor])){clearInterval(poll);clearTimeout(timer);resolve(events[cursor]);return;}},30);});
 readline.createInterface({input:child.stdout}).on('line',line=>{try{const e=JSON.parse(line);if(pending.has(e.id)){pending.get(e.id)(e);pending.delete(e.id);}else events.push(e);}catch{}});
 try{
  await rpc('initialize',{clientInfo:{name:'performance-compaction-check',version:'0.2.0'},capabilities:{experimentalApi:true}});child.stdin.write('{"method":"initialized"}\n');
  const inventory=await rpc('hooks/list',{cwds:[cwd]});
  const hooks=inventory.data.flatMap(e=>e.hooks).filter(h=>h.pluginId==='performance-engineering@performance-engineering');
  if(!hooks.length||hooks.some(h=>h.trustStatus!=='trusted'))throw Error('Own hooks require normal user trust review');
  const start=await rpc('thread/start',{cwd,approvalPolicy:'never',sandbox:'read-only',ephemeral:true});const threadId=start.thread.id;
  const finished=wait(e=>e.method==='turn/completed');
  await rpc('turn/start',{threadId,input:[{type:'text',text:'Review slow LCP image loading. Do not use tools or modify files. Reply only with the name of the asset skill suggested by the hook.'}]});await finished;
  const before=events.filter(e=>e.method==='hook/completed'&&own(e.params?.run));
  const compacted=wait(e=>e.method==='thread/compacted'||e.method==='item/completed'&&e.params?.item?.type==='contextCompaction');
  await rpc('thread/compact/start',{threadId});await compacted;
  const afterBoundary=events.length;
  const second=wait(e=>e.method==='turn/completed');
  await rpc('turn/start',{threadId,input:[{type:'text',text:'Review slow LCP image loading again. Do not use tools or modify files. Reply only with the name of the asset skill suggested by the hook.'}]});await second;
  const hookRuns=events.filter(e=>e.method==='hook/completed'&&own(e.params?.run)).map(e=>({event:e.params.run.eventName,status:e.params.run.status,context:e.params.run.entries.filter(x=>x.kind==='context').map(x=>x.text).join('\n')}));
  const subsequent=events.slice(afterBoundary).filter(e=>e.method==='hook/completed'&&own(e.params?.run));
  return {host:'codex',version:'0.163.0',nativeCompactionCompleted:true,initialHookEvents:before.map(e=>e.params.run.eventName),hookRuns:hookRuns.map(r=>({event:r.event,status:r.status,hasAssetGuidance:r.context.includes('asset-performance'),hasRouterGuidance:r.context.includes('skills/performance-engineering/SKILL.md')})),postCompactionAssetGuidance:subsequent.some(e=>JSON.stringify(e.params.run.entries).includes('asset-performance'))};
 }finally{fs.writeFileSync(path.join(output,'codex-events.jsonl'),events.map(e=>JSON.stringify(e)).join('\n'));fs.writeFileSync(path.join(output,'codex-stderr.log'),stderr);child.kill();fs.rmSync(cwd,{recursive:true,force:true});}
}
async function claude(){
 const cwd=fs.mkdtempSync(path.join(os.tmpdir(),'performance-compact-'));fs.writeFileSync(path.join(cwd,'package.json'),'{}');
 const run=async(label,extra,prompt)=>{
  const debug=path.join(output,'claude-'+label+'.log');
  const args=['-p','--permission-mode','plan','--tools','Read','--allowedTools','Read','--setting-sources','','--strict-mcp-config','--mcp-config','{"mcpServers":{}}','--plugin-dir',plugin,'--debug-file',debug,'--output-format','json',...extra,prompt];
  const child=spawn('claude',args,{cwd,stdio:['ignore','pipe','pipe']});let out='',err='';child.stdout.on('data',d=>out+=d);child.stderr.on('data',d=>err+=d);const timer=setTimeout(()=>child.kill(),120000);
  const code=await new Promise(r=>child.on('close',r));clearTimeout(timer);fs.writeFileSync(path.join(output,'claude-'+label+'.json'),out);if(code!==0)throw Error('Claude compaction stage failed: '+label);const result=JSON.parse(out);if(result.is_error)throw Error(result.result);return {result,debug};
 };
 try{
  const first=await run('before',[],'Review slow LCP image loading. Do not use tools. Reply only with the hook-suggested asset skill name.');
  const compact=await run('compact',['--resume',first.result.session_id],'/compact');
  const last=await run('after',['--resume',first.result.session_id],'Review slow LCP image loading again. Do not use tools. Reply only with the hook-suggested asset skill name.');
  const logs=[compact.debug,last.debug].map(f=>fs.readFileSync(f,'utf8')).join('\n');
  return {host:'claude',version:'2.1.303',nativeCompactionCompleted:!compact.result.is_error,sessionStartOnCompact:/SessionStart.*compact|source.*compact/i.test(logs),postCompactionAssetGuidance:/UserPromptSubmit.*additionalContext|hookEventName.*UserPromptSubmit.*asset-performance/s.test(logs),afterResponseHasAssetSkill:/asset-performance/.test(last.result.result)};
 }finally{fs.rmSync(cwd,{recursive:true,force:true});}
}
const results=await Promise.all((process.argv.slice(2).length?process.argv.slice(2):['codex','claude']).map(async host=>{try{return await(host==='codex'?codex():claude());}catch(e){return {host,error:e.message};}}));
fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results,null,2));
if(results.some(r=>r.error||!r.nativeCompactionCompleted||!r.postCompactionAssetGuidance))process.exitCode=1;
