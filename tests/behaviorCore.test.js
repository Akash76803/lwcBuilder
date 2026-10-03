import {test} from 'node:test';import assert from 'node:assert/strict';
import {parseExpression,evaluateExpression,parseTableFormula,evaluateTableFormula,assertType} from 'c/builderExpression';
import {topologicalOrder} from 'c/builderDependencyGraph';
import {createStateStore} from 'c/builderStateStore';
import {createEventRouter} from 'c/builderEventRouter';
import {createActionExecutor,applyCollectionAction} from 'c/builderActionExecutor';
import {migrate} from 'c/builderMigration';
const refs=[{id:'a',label:'A'},{id:'b',label:'B'}];
test('typed number evaluation preserves legacy precision and lazy IF results',()=>{
 for(const text of ['[A] * [B] + 0.1','ROUND(-1.235, 2)','IF([A] > 0, SUM([A], [B]), 1 / 0)','MIN([A], [B]) / MAX([A], [B])'])assert.equal(evaluateExpression(parseExpression(text,refs),id=>({a:231,b:21})[id],{a:'Number',b:'Number'}),evaluateTableFormula(parseTableFormula(text,refs),id=>({a:231,b:21})[id]));
 assert.equal(evaluateTableFormula(parseTableFormula('[A] + 1',refs),()=> '2'),3);
 assert.throws(()=>evaluateExpression(parseExpression('[A] + 1',refs),()=> '2',{a:'Number'}),/Number/);
});
test('typed Text Boolean and Date support comparisons without coercion or unsafe syntax',()=>{
 assert.equal(evaluateExpression(parseExpression('[A] = "ready"',refs),()=> 'ready',{a:'Text'}),true);
 assert.equal(evaluateExpression(parseExpression('[A] < DATE("2026-10-04")',refs),()=> '2026-10-03',{a:'Date'}),true);
 assert.equal(evaluateExpression(parseExpression('NOT [A]',refs),()=> false,{a:'Boolean'}),true);
 for(const text of ['window.alert(1)','eval(1)','"a"; 1','1 / 0','1e308 * 1e308'])assert.throws(()=>evaluateExpression(parseExpression(text,refs),()=>1,{a:'Number'}));
 assert.throws(()=>evaluateExpression(parseExpression('[A]',refs),()=>1,{}),/Missing/);
 assert.throws(()=>evaluateExpression(parseExpression('[A] = 1',refs),()=> '1',{a:'Text'}),/same/);
 assert.throws(()=>evaluateExpression(parseExpression('DATE("2026-02-29")'),()=>0),/Date/);
 assert.throws(()=>assertType(NaN,'Number'));assert.throws(()=>assertType('false','Boolean'));
});
test('dependency graph orders shared dependencies and rejects duplicate missing and circular nodes',()=>{
 assert.deepEqual(topologicalOrder([{id:'c',dependencies:['a','b']},{id:'b',dependencies:['a']},{id:'a'}]),['a','b','c']);
 for(const nodes of [[{id:'a'},{id:'a'}],[{id:'a',dependencies:['x']}],[{id:'a',dependencies:['b']},{id:'b',dependencies:['a']}]])assert.throws(()=>topologicalOrder(nodes));
});
const state=()=>createStateStore([{key:'a',type:'Number',kind:'input',defaultValue:2},{key:'b',type:'Number',defaultValue:3},{key:'total',type:'Number',kind:'computed',expression:parseExpression('[A] * [B]',refs)}]);
test('store atomic typed writes recompute and notify subscribed keys with versions and origin',()=>{
 const s=state(),changes=[];const off=s.subscribe('total',x=>changes.push(x));assert.equal(s.read('total'),6);s.write('a',4,{origin:'test',expectedVersion:0});assert.equal(s.read('total'),12);assert.equal(s.version('total'),1);assert.equal(changes[0].origin,'test');
 const before=s.snapshot();assert.throws(()=>s.write('a','4'),/Number/);assert.deepEqual(s.snapshot(),before);assert.throws(()=>s.write('a',5,{expectedVersion:0}),/Stale/);assert.throws(()=>s.write('total',5),/read-only/);off();s.reset('a');assert.equal(s.read('total'),6);assert.equal(changes.length,1);
});
test('computed failure rolls back values and versions; computed graph cycles reject',()=>{
 const s=createStateStore([{key:'a',type:'Number',defaultValue:2},{key:'b',type:'Number',kind:'computed',expression:parseExpression('1 / [A]',refs)}]);assert.throws(()=>s.write('a',0),/zero/);assert.equal(s.read('a'),2);assert.equal(s.version(),0);
 assert.throws(()=>createStateStore([{key:'a',type:'Number',kind:'computed',expression:parseExpression('[B]',refs)},{key:'b',type:'Number',kind:'computed',expression:parseExpression('[A]',refs)}]),/circular/);
 assert.throws(()=>s.define({key:'bad',type:'Number',kind:'computed',expression:parseExpression('[Missing]',[{id:'missing',label:'Missing'}])}));
 const o=createStateStore([{key:'items',type:'List',defaultValue:[]}]);o.write('items',[{rowId:'x'}]);const list=o.read('items');list.push({rowId:'y'});assert.equal(o.read('items').length,1);
});
test('router when filters, unsubscribe, origin propagation and automatic nested loop guard',()=>{
 const s=state(),router=createEventRouter({store:s,maxDepth:3}),seen=[];
 const off=router.register('node','change',e=>seen.push(e),parseExpression('[A] > 2',refs));router.dispatch('node','change',{});assert.equal(seen.length,0);s.write('a',4);router.dispatch('node','change',{});assert.equal(seen.length,1);off();
 router.register('a','go',e=>{seen.push(e);router.dispatch('b','go',{});});router.register('b','go',e=>{seen.push(e);router.dispatch('a','go',{});});assert.throws(()=>router.dispatch('a','go',{}),/depth/);assert.deepEqual(seen.at(-1).origin,seen.at(-2).origin);assert.equal(seen.at(-1).depth,2);assert.equal(router.dispatch('unused','go',{}).envelope.depth,0);
});
test('router nested callers cannot override active origin or reset the loop depth',()=>{
 const router=createEventRouter({maxDepth:2});router.register('a','loop',()=>router.dispatch('a','loop',{}, {origin:'fake',depth:0}));assert.throws(()=>router.dispatch('a','loop',{}),/depth/);assert.throws(()=>router.dispatch('a','loop',{}, {depth:-1}),/context/);
});
test('executor core collection actions deduplicate and preserve position; stop and continue report failures',()=>{
 const s=createStateStore([{key:'items',type:'List',defaultValue:[]},{key:'n',type:'Number',defaultValue:0}]),executor=createActionExecutor(s);
 let result=executor.execute([{type:'collectionUpsert',key:'items',entries:[{rowId:'a',value:1},{rowId:'b',value:2}]},{type:'collectionUpsert',key:'items',entries:[{rowId:'a',value:3}]},{type:'collectionRemove',key:'items',entries:[{rowId:'b'}]}]);assert.ok(result.every(r=>r.ok));assert.deepEqual(s.read('items'),[{rowId:'a',value:3}]);
 result=executor.execute([{type:'setState',key:'n',value:'bad',onError:'continue'},{type:'setState',key:'n',value:4},{type:'resetState',key:'n'}]);assert.deepEqual(result.map(r=>r.ok),[false,true,true]);assert.equal(s.read('n'),0);
 assert.equal(executor.execute([{type:'unknown'},{type:'setState',key:'n',value:8}]).length,1);
 executor.execute([{type:'collectionReplace',key:'items',entries:[{rowId:'c'}]}]);assert.deepEqual(s.read('items'),[{rowId:'c'}]);assert.throws(()=>applyCollectionAction([], 'upsert',[{}]),/key/);
});
test('migration is immutable idempotent and preserves existing fields without accepting future versions',()=>{
 const p={schemaVersion:1,nodes:[],versions:[{snapshot:{schemaVersion:1}}],custom:{x:1}},before=JSON.stringify(p),m=migrate(p);assert.equal(m.schemaVersion,2);assert.deepEqual(m.state,{});assert.deepEqual(m.events,[]);assert.deepEqual(m.actions,[]);assert.deepEqual(m.versions,p.versions);assert.equal(JSON.stringify(p),before);assert.deepEqual(migrate(m),m);assert.deepEqual(migrate({...p,state:{kept:true}}).state,{kept:true});assert.throws(()=>migrate({schemaVersion:3}),/Unsupported/);
});
