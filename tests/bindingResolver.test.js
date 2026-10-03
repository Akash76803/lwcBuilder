import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeNode,sample,validateProject,clone} from '../force-app/main/default/lwc/builderModel/builderModel.js';
import {createBindingResolver,stateDefinitions,parseStateValue,valueType,validateValueBindings} from '../force-app/main/default/lwc/builderBindingResolver/builderBindingResolver.js';
import {createRuntimeCoordinator} from '../force-app/main/default/lwc/builderRuntimeCoordinator/builderRuntimeCoordinator.js';
const bind=(node,key)=>{node.data.valueBinding={source:'state',key};return node;};
const definition=(key,type,defaultValue)=>({key,type,defaultValue});
test('typed state conversion accepts scalar/JSON values and rejects empty numbers invalid dates and wrong shapes',()=>{
 assert.equal(parseStateValue('0','Number'),0);assert.equal(parseStateValue('false','Boolean'),false);assert.deepEqual(parseStateValue('["a"]','List'),['a']);assert.deepEqual(parseStateValue('{"x":2}','Object'),{x:2});
 for(const [v,t] of [['','Number'],['Infinity','Number'],['yes','Boolean'],['2026-02-30','Date'],['{}','List'],['[]','Object']])assert.throws(()=>parseStateValue(v,t));
});
test('state definitions reject unsafe duplicate keys types and limits',()=>{
 const d=definition('qty','Number',0);assert.deepEqual(stateDefinitions({variables:[d]}),[d]);for(const variables of [[d,d],[{...d,key:'constructor'}],[{...d,key:'a.b'}],[{...d,type:'Unknown'}],[{...d,defaultValue:'0'}],Array.from({length:101},(_,i)=>({...d,key:'x'+i}))])assert.throws(()=>stateDefinitions({variables}));
});
test('two bound controls communicate via scoped store without mutating project or changing static defaults',()=>{
 const n=bind(makeNode('input','a'),'qty');n.props.inputType='number';const b=clone(n);b.id='b';const nodes=[n,b],before=clone(nodes),resolver=createBindingResolver();resolver.configure({variables:[definition('qty','Number',2)]});
 assert.equal(resolver.resolve(nodes,'design')[0].props.value,2);resolver.write(n,'7','design');assert.equal(resolver.resolve(nodes,'design')[1].props.value,7);assert.equal(resolver.resolve(nodes,'preview')[1].props.value,2);assert.deepEqual(nodes,before);assert.throws(()=>resolver.write(n,'abc','design'));assert.equal(resolver.read('qty','design'),7);
 resolver.reset('preview');assert.equal(resolver.read('qty','design'),7);resolver.reset('design');assert.equal(resolver.read('qty','design'),2);
});
test('same definitions preserve runtime values; changed defaults reset sessions and imports validate dangling bindings',()=>{
 const r=createBindingResolver(),n=bind(makeNode('input','a'),'name'),state={variables:[definition('name','Text','A')]};r.configure(state);r.write(n,'B','design');r.configure(clone(state));assert.equal(r.read('name','design'),'B');r.configure({variables:[definition('name','Text','C')]});assert.equal(r.read('name','design'),'C');
 const p=sample();p.state=state;p.nodes.push(n);assert.equal(validateProject(p),p);assert.throws(()=>validateValueBindings(p.nodes,{variables:[]}),/removed/);assert.throws(()=>validateValueBindings([n],{variables:[definition('name','Number',1)]}),/requires Text/);
});
test('lookup value binding preserves record-source pack and multiselect stores arrays; readonly writes reject',()=>{
 const n=bind(makeNode('lookup','l'),'retailer');n.data.packBinding={packId:'source'};const m=bind(makeNode('multiLookup','m'),'retailers'),r=createBindingResolver();r.configure({variables:[definition('retailer','Text',''),definition('retailers','List',[])]});r.write(n,'r1','design');assert.equal(r.resolve([n],'design')[0].data.packBinding.packId,'source');r.write(n,null,'design');assert.equal(r.read('retailer','design'),'');r.write(m,['r1','r2'],'design');assert.deepEqual(r.read('retailers','design'),['r1','r2']);n.props.disabled=true;assert.throws(()=>r.write(n,'r1','design'),/read-only/);
});
test('missing/incomplete binding shows explicit error; unbound legacy nodes remain identical',()=>{
 const r=createBindingResolver(),n=makeNode('input','i');assert.deepEqual(r.resolve([n],'design'),[n]);bind(n,'');assert.match(r.resolve([n],'design')[0].data.boundError,/Choose/);n.data.valueBinding.key='missing';assert.match(r.resolve([n],'design')[0].data.boundError,/Missing/);
 assert.equal(valueType({...n,props:{inputType:'toggle'}}),'Boolean');assert.equal(valueType({...n,props:{inputType:'date'}}),'Date');
});
test('runtime coordinator resolves bound values and isolates Preview reset from design',()=>{
 const runtime=createRuntimeCoordinator(),nodes=[bind(makeNode('textarea','a'),'name'),bind(makeNode('outputField','b'),'name')];runtime.configureState({variables:[definition('name','Text','Default')]});runtime.viewNodes(nodes,'design');runtime.writeBinding({componentId:'a',preview:false,value:'Updated'});assert.equal(runtime.viewNodes(nodes,'design')[1].props.value,'Updated');assert.equal(runtime.viewNodes(nodes,'preview')[1].props.value,'Default');runtime.writeBinding({componentId:'a',preview:true,value:'Preview'});runtime.reset('preview');assert.equal(runtime.viewNodes(nodes,'preview')[1].props.value,'Default');assert.equal(runtime.stateSnapshot('design').name,'Updated');
});
test('explicit Data Pack value binding converts typed scalar fields and reports incompatible/missing output without changing legacy pack reads',()=>{
 const r=createBindingResolver(),n=makeNode('input','n');n.props.inputType='number';n.data.valueBinding={source:'pack'};n.data.packBinding={packId:'p'};n.data.boundSample=12;
 assert.equal(r.resolve([n],'design')[0].props.value,12);n.data.boundSample='abc';assert.match(r.resolve([n],'design')[0].data.boundError,/Number/);delete n.data.packBinding;assert.match(r.resolve([n],'design')[0].data.boundError,/Choose a Data Pack/);
 const legacy=makeNode('input','legacy');legacy.data.packBinding={packId:'p'};legacy.data.boundSample='Acme';assert.deepEqual(r.resolve([legacy],'design'),[legacy]);
 const numericOutput=bind(makeNode('badge','o'),'qty');assert.doesNotThrow(()=>validateValueBindings([numericOutput],{variables:[definition('qty','Number',0)]}));
});
