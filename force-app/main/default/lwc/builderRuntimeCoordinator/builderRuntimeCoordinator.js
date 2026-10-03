// Compatibility binding bridge; no DOM and no editor-owned runtime table state.
import {createStateStore} from 'c/builderStateStore';
import {createEventRouter} from 'c/builderEventRouter';
import {tableConfig,tableRuntimePack,defaultSummaryConfig} from 'c/builderTableModel';
import {componentDefinition} from 'c/builderRegistry';
const clone=v=>JSON.parse(JSON.stringify(v));
const flatten=nodes=>nodes.flatMap(n=>[n,...flatten(n.children||[])]);
export const runtimePackKey=(scope,nodeId,name='$runtime')=>'pack:'+scope+':'+JSON.stringify([nodeId,name]);
const signature=node=>JSON.stringify([node.props.tableConfig,node.data]);
export function createRuntimeCoordinator() {
 const store=createStateStore(),router=createEventRouter({store}),sources=new Map(),unregister=new Map();
 function publish(key,value,origin){if(!store.has(key))store.define({key,type:'Object',defaultValue:{}});store.write(key,value,{origin});}
 function output(scope,node,payload,origin){const key=runtimePackKey(scope,node.id);const pack={rows:payload.rows,selectedRows:payload.selectedRows,changedRows:payload.changedRows,rowIds:payload.rowIds,entries:payload.entries,outputPacks:payload.outputPacks,lastEvent:{type:payload.type,rowId:payload.rowId,row:payload.row},valid:payload.valid};publish(key,{signature:signature(node),pack},origin);for(const [name,value] of Object.entries(payload.outputPacks||{}))publish(runtimePackKey(scope,node.id,name),{signature:signature(node),pack:value},origin);}
 function prepare(nodes,scope){const all=flatten(nodes);sources.set(scope,new Map(all.map(n=>[n.id,n])));
  for(const key of store.keys().filter(k=>k.startsWith('pack:'+scope+':'))){const [id,name]=JSON.parse(key.slice(('pack:'+scope+':').length));const source=sources.get(scope).get(id),entry=store.read(key);if(!source||entry.signature!==signature(source)||(name!=='$runtime'&&!tableConfig(source).outputPacks.some(p=>p.name===name)))if(Object.keys(entry).length)store.reset(key);}
  for(const n of all){const definition=componentDefinition(n.type);if(!definition)continue;for(const event of definition.adapter.eventsOut){const k=JSON.stringify([scope,n.id,event]);if(!unregister.has(k))unregister.set(k,router.register(scope+':'+n.id,event,envelope=>{const source=sources.get(scope)?.get(n.id);if(source&&definition.adapter.runtimeOutput)output(scope,source,envelope.payload,envelope.origin);}));}}
  for(const [k,off] of unregister){const [registeredScope,id]=JSON.parse(k);if(registeredScope===scope&&!sources.get(scope).has(id)){off();unregister.delete(k);}}
  return nodes;
 }
 function readPack(scope,node){const entry=store.read(runtimePackKey(scope,node.id));return entry?.signature===signature(node)?entry.pack:tableRuntimePack(node);}
 function summary(node,scope){const data=clone(node.data),config=node.props.summaryConfig||defaultSummaryConfig();if(!config.sourceTableId)return data;
  try{const source=sources.get(scope)?.get(config.sourceTableId);if(!source||!componentDefinition(source.type)?.adapter.runtimeOutput)throw Error('Source table was removed; choose a new source');const available=tableConfig(source).columns.map(c=>c.source==='field'?c.path:c.source==='input'?c.key:c.id);if(config.metrics.some(m=>!available.includes(m.path))||(config.groupBy&&!available.includes(config.groupBy)))throw Error('A summary source column was removed or rebound; update summary fields');const pack=readPack(scope,source);data.boundSample=config.scope==='selected'?pack.selectedRows:pack.rows;data.boundError=pack.valid?'':'Source contains validation errors; summary is provisional.';data.runtimePack={sourceTableId:source.id,scope:config.scope,rows:data.boundSample,valid:pack.valid};data.runtimeCaption=source.label+' · Runtime Data Pack · '+config.scope+' rows';}catch(e){data.boundError=e.message;data.boundSample=[];}return data;
 }
 function viewNodes(nodes,scope){prepare(nodes,scope);const result=clone(nodes);for(const n of flatten(result))if(componentDefinition(n.type)?.adapter.runtimeConsumer==='summary')n.data=summary(n,scope);return result;}
 function sourcesForEditor(nodes){return flatten(nodes).filter(n=>componentDefinition(n.type)?.adapter.runtimeOutput).map(n=>({id:n.id,label:n.label,columns:tableConfig(n).columns.map(c=>({path:c.source==='field'?c.path:c.source==='input'?c.key:c.id,label:c.label}))}));}
 function dispatch(detail){const scope=detail.preview?'preview':'design',node=sources.get(scope)?.get(detail.componentId);if(!node)return null;const contract=componentDefinition(node.type)?.adapter;if(!contract?.eventsOut.includes(detail.eventName))throw Error('Undeclared adapter event: '+detail.eventName);return router.dispatch(scope+':'+node.id,detail.eventName,detail.payload);}
 function reset(scope){for(const key of store.keys())if(!scope||key.startsWith('pack:'+scope+':'))store.reset(key);}
 return {store,router,prepare,viewNodes,summary,sourcesForEditor,dispatch,reset,subscribeSummary:(node,scope,fn)=>store.subscribe(runtimePackKey(scope,(node.props.summaryConfig||{}).sourceTableId),fn)};
}
