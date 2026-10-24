import {createHash} from 'node:crypto';

// Executable teaching fixture: production persistence needs the same predicates
// and idempotency record in one durable transaction across all server instances.
export class VersionedStore {
 #records=new Map(); #receipts=new Map();
 #key(tenant,id){return JSON.stringify([tenant,id]);}
 read(tenant,id){return {...(this.#records.get(this.#key(tenant,id))??{value:false,revision:0})};}
 write({tenant,id,value,ifMatch,mutationId}){
  if(typeof value!=='boolean'||!/^[-\w]{1,80}$/.test(mutationId??''))return {status:400};
  const key=this.#key(tenant,id), receiptKey=JSON.stringify([tenant,id,mutationId]);
  const fingerprint=createHash('sha256').update(JSON.stringify([value,ifMatch])).digest('hex');
  const previous=this.#receipts.get(receiptKey);
  if(previous)return previous.fingerprint===fingerprint?{...previous.result,replayed:true}:{status:409};
  const current=this.read(tenant,id);
  if(!ifMatch)return {status:428};
  if(ifMatch!==`"${current.revision}"`)return {status:412,current};
  // No await between comparison and mutation in this single-process fixture.
  const record={value,revision:current.revision+1};this.#records.set(key,record);
  const result={status:200,record};this.#receipts.set(receiptKey,{fingerprint,result});
  if(this.#receipts.size>1000)this.#receipts.delete(this.#receipts.keys().next().value);
  return result;
 }
}
