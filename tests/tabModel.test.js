import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeNode,validateProject,sample} from '../force-app/main/default/lwc/builderModel/builderModel.js';
import {resolveActiveTab,tabForSelection} from '../force-app/main/default/lwc/builderTabModel/builderTabModel.js';
const tabs=()=>{const n=makeNode('tabs','tabs');n.children=[makeNode('tab','a'),makeNode('tab','b')];return n;};
test('tab identity survives rename reorder and JSON; requested overrides default',()=>{const n=tabs();n.props.defaultTabId='b';assert.equal(resolveActiveTab(n),'b');assert.equal(resolveActiveTab(n,'a'),'a');n.children.reverse();n.children[0].label='Renamed';assert.equal(resolveActiveTab(JSON.parse(JSON.stringify(n))),'b');});
test('selection reveals containing tab including nested descendants',()=>{const n=tabs();const grid=makeNode('grid','grid');grid.children=[makeNode('input','input')];n.children[1].children=[grid];assert.equal(tabForSelection(n,'input'),'b');assert.equal(tabForSelection(n,'b'),'b');assert.equal(tabForSelection(n,'tabs'),'');});
test('deleted hidden disabled and empty tabs fall back safely',()=>{const n=tabs();n.props.defaultTabId='b';assert.equal(resolveActiveTab(n,'b',v=>v.id!=='b'),'a');n.children.pop();assert.equal(resolveActiveTab(n,'b'),'a');n.children=[];assert.equal(resolveActiveTab(n),'');});
test('tab config validates default type and leaves legacy projects unchanged',()=>{const p=sample(),n=tabs();p.nodes.push(n);const copy=JSON.parse(JSON.stringify(p));assert.deepEqual(validateProject(p),copy);n.props.defaultTabId=5;assert.throws(()=>validateProject(p),/Default tab/);});
