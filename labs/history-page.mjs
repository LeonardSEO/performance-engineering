export const historyPage=`<!doctype html><html lang="en"><meta charset="utf-8"><title>History scope fixture</title>
<h1>History restoration</h1><section id="private" hidden></section><p id="status">Checking scope</p><a href="/health">Leave</a>
<script>
// Synthetic identities only. Production must use the real server auth/session.
const state={events:[],settled:false,scope:null};window.historyLab=state;let generation=0;
const content=document.querySelector('#private');
addEventListener('pagehide',()=>{content.hidden=true;generation++;state.events.push({type:'pagehide',masked:content.hidden});});
addEventListener('pageshow',async event=>{
 content.hidden=true;state.settled=false;state.events.push({persisted:event.persisted});
 const request=++generation,scope=localStorage.getItem('fixtureScope')==='b'?'b':'a';
 try{
  const response=await fetch('/preference',{headers:{Authorization:'Bearer fixture-'+scope}});if(!response.ok)throw Error('Scope unavailable');await response.json();
  if(request!==generation||(localStorage.getItem('fixtureScope')??'a')!==scope)return;
  content.textContent='Authorized fixture scope '+scope;content.hidden=false;state.scope=scope;state.settled=true;document.querySelector('#status').textContent='Ready';
 }catch{document.querySelector('#status').textContent='Refresh failed';state.settled=true;}
});
</script></html>`;
