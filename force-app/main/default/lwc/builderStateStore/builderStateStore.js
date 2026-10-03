import {assertType,evaluateExpression,formulaReferences} from 'c/builderExpression';
import {topologicalOrder} from 'c/builderDependencyGraph';
const copy=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
const safeKey=key=>typeof key==='string'&&key.length>0&&!key.split(/[.:/]/).some(s=>['__proto__','constructor','prototype'].includes(s));
export function createStateStore(definitions=[]) {
 let specs=new Map(),values=new Map(),versions=new Map(),version=0,order=[],notifying=0;
 const listeners=new Map();
 function compute(next,definitionsMap=specs,sequence=order){const types=Object.fromEntries([...definitionsMap].map(([k,s])=>[k,s.type]));for(const key of sequence){const s=definitionsMap.get(key);if(s.kind==='computed'){const value=evaluateExpression(s.expression,id=>{if(!next.has(id))throw Error('Missing state: '+id);return next.get(id);},types);assertType(value,s.type,s.nullable);next.set(key,copy(value));}}}
 function defineMany(defs){const nextSpecs=new Map(specs),next=new Map(values);
  for(const raw of defs){const s={kind:'variable',nullable:false,...raw};if(!safeKey(s.key)||nextSpecs.has(s.key))throw Error('State keys must be safe and unique');if(!['variable','input','computed'].includes(s.kind))throw Error('Invalid state kind');if(s.kind==='computed'&&!s.expression)throw Error('Computed state needs an expression');if(s.kind!=='computed'){assertType(s.defaultValue,s.type,s.nullable);next.set(s.key,copy(s.defaultValue));}nextSpecs.set(s.key,copy(s));}
  const sequence=topologicalOrder([...nextSpecs].map(([id,s])=>({id,dependencies:s.kind==='computed'?formulaReferences(s.expression):[]})));compute(next,nextSpecs,sequence);specs=nextSpecs;values=next;order=sequence;for(const key of specs.keys())if(!versions.has(key))versions.set(key,0);
 }
 function write(key,value,context={}){if(notifying>=32)throw Error('State subscription chain depth exceeded');const s=specs.get(key);if(!s)throw Error('Unknown state: '+key);if(s.kind==='computed')throw Error('Computed state is read-only');if(context.expectedVersion!==undefined&&context.expectedVersion!==versions.get(key))throw Error('Stale state version');assertType(value,s.type,s.nullable);const next=new Map(values);next.set(key,copy(value));compute(next);const changed=[...next].filter(([k,v])=>k===key||JSON.stringify(v)!==JSON.stringify(values.get(k))).map(([k])=>k);values=next;version++;for(const k of changed)versions.set(k,version);
  const changes=changed.map(k=>({key:k,value:copy(values.get(k)),version,origin:context.origin||null}));notifying++;try{for(const change of changes)for(const fn of [...(listeners.get(change.key)||[]),...(listeners.get('*')||[])])fn(change);}finally{notifying--;}return {ok:true,version,value:copy(values.get(key))};
 }
 function reset(key,context){const s=specs.get(key);if(!s)throw Error('Unknown state: '+key);return write(key,s.defaultValue,context);}
 function subscribe(key,fn){if(typeof fn!=='function')throw Error('Subscriber must be a function');if(!listeners.has(key))listeners.set(key,new Set());listeners.get(key).add(fn);return ()=>listeners.get(key)?.delete(fn);}
 defineMany(definitions);
 return {define:definition=>defineMany([definition]),defineMany,write,reset,subscribe,read:key=>copy(values.get(key)),has:key=>specs.has(key),type:key=>specs.get(key)?.type,keys:()=>[...specs.keys()],version:key=>key===undefined?version:versions.get(key),snapshot:()=>Object.fromEntries([...values].map(([k,v])=>[k,copy(v)]))};
}
