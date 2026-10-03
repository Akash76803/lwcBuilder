import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {createRuntimeCoordinator,runtimePackKey} from 'c/builderRuntimeCoordinator';import {tableSamples,resolveTableRowIds,evaluateTableRow,buildTableEvent,summarizeRows} from 'c/builderTableModel';
const fixtures=JSON.parse(readFileSync(new URL('./fixtures/tableSummaryBaseline.json',import.meta.url),'utf8'));
const copy=v=>JSON.parse(JSON.stringify(v));
for(const fixture of fixtures)test('store table-to-summary matches pre-refactor f9cc872 golden '+fixture.kind,()=>{
 const {node,inputs,summary}=copy(fixture),runtime=createRuntimeCoordinator(),summaryNode={id:'summary',type:'summaryTable',props:{summaryConfig:summary},data:{},children:[]};runtime.prepare([node,summaryNode],'preview');
 const ids=resolveTableRowIds(tableSamples,node.props.tableConfig.identity),evaluated=tableSamples.map((row,i)=>({row,rowId:ids[i],inputs:inputs[ids[i]]||{},result:evaluateTableRow(row,inputs[ids[i]]||{},node.props.tableConfig)}));const event=buildTableEvent(node.props.tableConfig,evaluated,['p1'],['p1'],'rowselection',{rowId:'p1'});
 assert.deepEqual(copy(event),fixture.event);let notifications=0;const off=runtime.subscribeSummary(summaryNode,'preview',()=>notifications++);runtime.dispatch({componentId:node.id,preview:true,eventName:'tablechange',payload:event});assert.equal(notifications,1);
 const data=runtime.summary(summaryNode,'preview');assert.deepEqual(data.boundSample,fixture.event.selectedRows);assert.deepEqual(summarizeRows(data.boundSample,summary),fixture.expectedSummary);assert.equal(data.runtimePack.valid,fixture.event.valid);assert.equal(data.boundError,fixture.event.valid?'':'Source contains validation errors; summary is provisional.');
 assert.deepEqual(runtime.store.read(runtimePackKey('preview','items','runtime')).pack,fixture.event.outputPacks.runtime);assert.deepEqual(runtime.store.read(runtimePackKey('preview','items')).pack.rows,fixture.event.rows);
 assert.equal(runtime.summary(summaryNode,'design').boundSample.length,0);off();
});
test('runtime namespaces isolate packs; signatures resets and removed-column errors retain compatibility',()=>{
 const f=copy(fixtures[0]),runtime=createRuntimeCoordinator(),summary={id:'summary',type:'summaryTable',props:{summaryConfig:f.summary},data:{},children:[]};runtime.prepare([f.node],'design');runtime.prepare([f.node],'preview');runtime.dispatch({componentId:'items',eventName:'tablechange',payload:f.event,preview:false});assert.equal(runtime.summary(summary,'design').boundSample[0].quantity,50);assert.equal(runtime.summary(summary,'preview').boundSample.length,0);
 runtime.reset('design');assert.equal(runtime.summary(summary,'design').boundSample.length,0);runtime.dispatch({componentId:'items',eventName:'tablechange',payload:f.event});f.node.label='Renamed';runtime.prepare([f.node],'design');assert.equal(runtime.summary(summary,'design').boundSample[0].quantity,50);
 f.node.props.tableConfig.columns=f.node.props.tableConfig.columns.filter(c=>c.id!=='qty');runtime.prepare([f.node],'design');assert.match(runtime.summary(summary,'design').boundError,/removed or rebound/);runtime.prepare([],'design');assert.match(runtime.summary(summary,'design').boundError,/removed/);
});
test('same named packs and IDs containing delimiters do not collide across nodes',()=>{
 const runtime=createRuntimeCoordinator(),f=copy(fixtures[1]),other=copy(f.node);other.id='items:other';runtime.prepare([f.node,other],'design');runtime.dispatch({componentId:'items',eventName:'tablechange',payload:f.event});runtime.dispatch({componentId:other.id,eventName:'tablechange',payload:{...f.event,rows:[]}});assert.equal(runtime.store.read(runtimePackKey('design','items')).pack.rows.length,2);assert.equal(runtime.store.read(runtimePackKey('design',other.id)).pack.rows.length,0);assert.throws(()=>runtime.dispatch({componentId:'items',eventName:'undeclared',payload:{}}),/Undeclared/);
});
