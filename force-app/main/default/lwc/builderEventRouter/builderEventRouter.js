import {evaluateExpression} from 'c/builderExpression';
export function createEventRouter({store,maxDepth=16}={}) {
 if(!Number.isInteger(maxDepth)||maxDepth<1)throw Error('Invalid event chain depth');
 const handlers=new Map();let active=null,sequence=0;
 const key=(node,event)=>JSON.stringify([node,event]);
 function register(node,event,handler,when=null){if(typeof handler!=='function')throw Error('Event handler must be a function');const k=key(node,event),record={handler,when};if(!handlers.has(k))handlers.set(k,new Set());handlers.get(k).add(record);return ()=>handlers.get(k)?.delete(record);}
 function dispatch(node,event,payload,context){const parent=context||active;const envelope={node,event,payload,origin:parent?.origin||{node,event,id:++sequence},depth:parent?parent.depth+1:0};if(envelope.depth>=maxDepth)throw Error('Event chain depth exceeded');const before=active;active=envelope;const results=[];try{for(const {handler,when} of handlers.get(key(node,event))||[]){if(when){const types=Object.fromEntries((store?.keys()||[]).map(k=>[k,store.type(k)]));const match=evaluateExpression(when,id=>{if(!store?.has(id))throw Error('Missing condition state: '+id);return store.read(id);},types);if(typeof match!=='boolean')throw Error('Event when must return Boolean');if(!match)continue;}results.push(handler(envelope));}}finally{active=before;}return {envelope,results};}
 return {register,dispatch};
}
