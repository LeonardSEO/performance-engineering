import {test} from 'node:test';
import assert from 'node:assert/strict';
import {startLab} from '../labs/server.mjs';

test('real HTTP writes enforce CAS across tabs, restarted clients, scope and a lost response',async t=>{
 const lab=await startLab();t.after(lab.close);
 const headers={Authorization:'Bearer fixture-a','Content-Type':'application/json'};
 const read=()=>fetch(lab.url+'/preference',{headers});
 const put=(value,tag,key,suffix='')=>fetch(lab.url+'/preference'+suffix,{method:'PUT',headers:{...headers,...(tag?{'If-Match':tag}:{}),'Idempotency-Key':key},body:JSON.stringify({value})});
 const initial=await read();assert.equal(initial.headers.get('etag'),'"0"');
 const tabs=await Promise.all([put(true,'"0"','tab-a'),put(false,'"0"','tab-b')]);
 assert.deepEqual(tabs.map(x=>x.status).sort(),[200,412]);
 assert.equal((await (await read()).json()).revision,1);
 assert.equal((await put(false,'"0"','restarted-client-counter-1')).status,412);
 assert.equal((await put(false,null,'missing-precondition')).status,428);
 await assert.rejects(()=>put(false,'"1"','uncertain-write','?drop=1'));
 assert.deepEqual(await (await read()).json(),{value:false,revision:2});
 const retry=await put(false,'"1"','uncertain-write');assert.equal(retry.status,200);assert.equal(retry.headers.get('idempotency-replayed'),'true');
 assert.equal((await retry.json()).revision,2);
 assert.equal((await put(true,'"1"','uncertain-write')).status,409);
 const other=await fetch(lab.url+'/preference',{headers:{Authorization:'Bearer fixture-b'}});assert.deepEqual(await other.json(),{value:false,revision:0});
 assert.equal((await fetch(lab.url+'/preference')).status,401);
});
test('HTTP ETag revalidation returns a bodyless 304 and avoids a second body transfer',async t=>{
 const lab=await startLab();t.after(lab.close);
 const first=await fetch(lab.url+'/revalidate');assert.equal(first.status,200);await first.text();
 const next=await fetch(lab.url+'/revalidate',{headers:{'If-None-Match':first.headers.get('etag')}});
 assert.equal(next.status,304);assert.equal(await next.text(),'');
 assert.equal((await (await fetch(lab.url+'/counters')).json()).revalidationBodies,1);
});
