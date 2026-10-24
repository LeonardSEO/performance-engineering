// Explicit integration test: stage installer state without changing the real agent homes.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
const repo=fileURLToPath(new URL('../',import.meta.url));
const source=process.argv[2]??repo;
const output=process.argv[3]??path.join(repo,'validation/private/installers');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'performance-installs-'));fs.mkdirSync(output,{recursive:true});
const shim=path.join(root,'isolate-node-home.mjs');
fs.writeFileSync(shim,`import os from 'node:os';import {syncBuiltinESMExports} from 'node:module';os.homedir=()=>process.env.PERFORMANCE_INSTALL_HOME;syncBuiltinESMExports();\n`);
function run(args,env){return new Promise(resolve=>{
 const c=spawn('npx',['--yes','plugins@1.3.5',...args],{cwd:repo,env,stdio:['ignore','pipe','pipe']});let stdout='',stderr='';
 c.stdout.on('data',d=>stdout+=d);c.stderr.on('data',d=>stderr+=d);c.on('error',e=>resolve({code:null,stdout,stderr:e.message}));c.on('close',code=>resolve({code,stdout,stderr}));
});}
const results=[];
try{
 for(const target of ['codex','claude-code','auto']){
  const home=path.join(root,target);fs.mkdirSync(home,{recursive:true});
  const env={...process.env,PERFORMANCE_INSTALL_HOME:home,CLAUDE_CONFIG_DIR:path.join(home,'.claude'),DISABLE_TELEMETRY:'1',DO_NOT_TRACK:'1',NODE_OPTIONS:(process.env.NODE_OPTIONS??'')+' --import='+pathToFileURL(shim).href};
  const result=await run(['add',source,'--yes',...(target==='auto'?[]:['--target',target])],env);
  fs.writeFileSync(path.join(output,target+'.log'),result.stdout+'\n'+result.stderr);
  assert.equal(result.code,0,`Installer ${target} failed; see private log.`);
  const expected=target==='auto'?['codex','claude-code']:[target];
  const inventories={};
  for(const host of expected){
   const cache=path.join(home,host==='codex'?'.codex':'.claude','plugins/cache');
   const matches=[];
   const walk=(d,depth=0)=>{if(depth>6||!fs.existsSync(d))return;for(const entry of fs.readdirSync(d,{withFileTypes:true})){const full=path.join(d,entry.name);if(entry.isDirectory()){if(fs.existsSync(path.join(full,'skills'))&&fs.existsSync(path.join(full,host==='codex'?'.codex-plugin/plugin.json':'.claude-plugin/plugin.json')))matches.push(full);else walk(full,depth+1);}}};walk(cache);
   assert.ok(matches.length>0,`${host}: no actual installed copy in its cache`);
   const installed=matches[0],names=fs.readdirSync(path.join(installed,'skills')).sort();assert.equal(names.length,9);
   const manifest=JSON.parse(fs.readFileSync(path.join(installed,host==='codex'?'.codex-plugin/plugin.json':'.claude-plugin/plugin.json')));
   const expectedHook=`./hooks/${host==='codex'?'codex':'claude'}.json`;assert.equal(manifest.hooks,expectedHook);
   const config=JSON.parse(fs.readFileSync(path.join(installed,expectedHook)));assert.equal(Object.keys(config.hooks).length,3);
   inventories[host]={skills:names,events:Object.keys(config.hooks),adapter:expectedHook};
  }
  results.push({target,exit:result.code,inventories});console.log('PASS isolated installer: '+target);
 }
 fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({installer:'plugins@1.3.5',source:source.startsWith('LeonardSEO/')?source:'local checkout',node:process.version,method:'Node os.homedir shim for the Node installer, CLAUDE_CONFIG_DIR for child native Claude registration; actual HOME and CODEX_HOME untouched.',results},null,2)+'\n');
}finally{fs.rmSync(root,{recursive:true,force:true});}
