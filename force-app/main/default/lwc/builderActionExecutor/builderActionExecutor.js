// Shared table collection semantics. Key replacement retains original position.
export function applyCollectionAction(items,operation,entries,key='rowId') {
 if(!Array.isArray(items)||!Array.isArray(entries))throw Error('Collection action requires lists');
 if(!['upsert','remove','replace'].includes(operation))throw Error('Unknown collection operation');
 for(const entry of [...items,...entries])if(!entry||entry[key]===null||entry[key]===undefined||entry[key]==='')throw Error('Collection entry needs a key');
 let result=[...items];
 if(operation==='remove'){const keys=new Set(entries.map(e=>e[key]));result=result.filter(e=>!keys.has(e[key]));}
 if(operation==='upsert')for(const entry of entries){const index=result.findIndex(e=>e[key]===entry[key]);if(index<0)result.push(entry);else result[index]=entry;}
 if(operation==='replace')result=[...entries];
 if(result.length>1000)throw Error('Collection exceeds 1000 rows');return result;
}
export function createActionExecutor(store) {
 function execute(actions,context={}){const results=[];for(const action of actions){try{if(action.onError!==undefined&&!['stop','continue'].includes(action.onError))throw Error('Invalid onError policy');let result;
  if(action.type==='setState')result=store.write(action.key,action.value,context);
  else if(action.type==='resetState')result=store.reset(action.key,context);
  else {const op={collectionUpsert:'upsert',collectionRemove:'remove',collectionReplace:'replace'}[action.type];if(!op)throw Error('Unknown core action: '+action.type);result=store.write(action.key,applyCollectionAction(store.read(action.key),op,action.entries,action.rowKey||'rowId'),context);}
  results.push({ok:true,result});
 }catch(e){results.push({ok:false,error:e.message});if(action.onError!=='continue')break;}}return results;}
 return {execute};
}
