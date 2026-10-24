// Explicit authenticated native-host test; not called by hooks or ordinary CI.
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const repo=fileURLToPath(new URL('../',import.meta.url));
const plugin=path.join(repo,'plugins/performance-engineering');
const output=path.resolve(process.env.PERFORMANCE_SMOKE_OUTPUT??path.join(repo,'validation/private/native-smoke'));fs.mkdirSync(output,{recursive:true});
await Promise.all((process.argv.slice(2).length?process.argv.slice(2):['claude','codex']).map(async host=>{
 const cwd=fs.mkdtempSync(path.join(os.tmpdir(),'performance-native-smoke-'));fs.writeFileSync(path.join(cwd,'package.json'),'{}');
 const prompt=(host==='codex'?'Use the apply_patch file-edit tool; do not use shell redirection or a shell command. ':'')+'Create style.css in this scratch directory containing exactly `.notice { opacity: 1; }`. Then report only the name of any domain skill suggested by a hook after the file write. Do not inspect or modify any other files.';
 const args=host==='claude'?['-p','--permission-mode','acceptEdits','--tools','Write','--allowedTools','Write','--setting-sources','','--strict-mcp-config','--mcp-config','{"mcpServers":{}}','--plugin-dir',plugin,'--debug-file',path.join(output,'claude-debug.log'),'--output-format','json',prompt]:['exec','--ephemeral','--skip-git-repo-check','--sandbox','workspace-write','--json','-c','plugins.performance-engineering@performance-engineering.enabled=true',prompt];
 const child=spawn(host,args,{cwd,stdio:['ignore','pipe','pipe']});let stdout='',stderr='';child.stdout.on('data',d=>stdout+=d);child.stderr.on('data',d=>stderr+=d);const timer=setTimeout(()=>child.kill('SIGTERM'),90000);
 const code=await new Promise(r=>child.on('close',r));clearTimeout(timer);
 let text='';try{if(host==='claude')text=JSON.parse(stdout).result??'';else for(const l of stdout.split('\n')){try{const e=JSON.parse(l);if(e.type==='item.completed'&&e.item?.type==='agent_message')text+=e.item.text+'\n';}catch{}}}catch{}
 const file=path.join(cwd,'style.css');const value=fs.existsSync(file)?fs.readFileSync(file,'utf8'):null;
 fs.writeFileSync(path.join(output,host+'.json'),JSON.stringify({host,code,fileWritten:!!value,expectedContent:value?.trim()==='.notice { opacity: 1; }',receivedRenderingGuidance:/rendering-performance/.test(text),text},null,2));
 fs.writeFileSync(path.join(output,host+'.log'),stdout+'\n'+stderr);console.log(host,code,value,text);fs.rmSync(cwd,{recursive:true,force:true});
 assert.equal(code,0,`${host}: native run failed`);
 assert.equal(value?.trim(),'.notice { opacity: 1; }',`${host}: scratch file differs`);
 assert.match(text,/rendering-performance/,`${host}: no observed post-write domain guidance`);
}));
