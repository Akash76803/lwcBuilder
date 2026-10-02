import {test} from 'node:test';
import assert from 'node:assert/strict';
import {registry,canContain,makeNode,insert,move,clone,sample,validateProject,find} from '../force-app/main/default/lwc/builderModel/builderModel.js';
test('every registry component has a serializable default definition',()=>{
 assert.equal(new Set(registry.map(c=>c.type)).size,registry.length);
 for(const c of registry){const n=makeNode(c.type,c.type);assert.equal(n.label,c.label);assert.deepEqual(JSON.parse(JSON.stringify(n)),n);for(const prop of c.properties)assert.ok(Object.hasOwn(n.props,prop.key));}
});
test('structural children require matching parents and rejection is atomic',()=>{
 const nodes=[makeNode('tabs','tabs'),makeNode('recordEditForm','edit'),makeNode('recordViewForm','view')];
 const before=clone(nodes);assert.throws(()=>insert(nodes,makeNode('tab','tab')));assert.deepEqual(nodes,before);
 insert(nodes,makeNode('tab','tab'),'tabs');insert(nodes,makeNode('inputField','field'),'edit');insert(nodes,makeNode('outputField','output'),'view');
 const after=clone(nodes);assert.throws(()=>move(nodes,'field','view'));assert.deepEqual(nodes,after);assert.throws(()=>move(nodes,'tab',null));assert.deepEqual(nodes,after);
 assert.equal(canContain('tabs','input'),false);assert.equal(canContain('accordion','accordionSection'),true);
});
test('new registry nodes and legacy tabs round trip with packs intact',()=>{
 const p=sample();const tabs=makeNode('tabs','t');tabs.children=[makeNode('input','legacy')];p.nodes.push(tabs);p.dataPacks=[];
 assert.deepEqual(validateProject(JSON.parse(JSON.stringify(p))),p);
 const form=makeNode('recordEditForm','edit');form.children=[makeNode('inputField','name')];p.nodes.push(form);assert.equal(find(validateProject(p).nodes,'name').props.fieldApiName,'Name');
});
test('leaf children and invalid record field placement reject import',()=>{
 const p=sample();find(p.nodes,'customer').children=[makeNode('input','invalid')];assert.throws(()=>validateProject(p),/Leaf/);
 const other=sample();other.nodes[0].children.push(makeNode('inputField','invalid'));assert.throws(()=>validateProject(other),/nesting/);
});
