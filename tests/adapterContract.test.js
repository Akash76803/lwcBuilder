import {test} from 'node:test';import assert from 'node:assert/strict';
import * as legacy from 'c/builderModel';import {registry,canContain} from 'c/builderRegistry';import {validateProject} from 'c/builderValidation';import {migrate} from 'c/builderMigration';
for(const entry of registry)test(entry.type+' adapter contract retains defaults nesting and declared events',()=>{
 assert.equal(legacy.componentDefinition(entry.type),entry);const node=legacy.makeNode(entry.type,'test');
 assert.ok(entry.adapter.propsIn.includes('node'));assert.ok(Array.isArray(entry.adapter.eventsOut));assert.ok(Array.isArray(entry.adapter.commands));assert.deepEqual(JSON.parse(JSON.stringify(entry.adapter)),entry.adapter);
 for(const prop of entry.properties)assert.deepEqual(node.props[prop.key],prop.default);
 assert.equal(canContain(entry.type,'section'),entry.container&&!['tabs','accordion','recordEditForm','recordViewForm'].includes(entry.type));
 if(entry.type==='table')assert.deepEqual(entry.adapter.eventsOut,['tablechange']);
 else if(legacy.isSelectionType(entry.type))assert.deepEqual(entry.adapter.eventsOut,['selectionchange']);
 else assert.deepEqual(entry.adapter.eventsOut,entry.events);
});
test('v1 and migrated v2 preserve node configuration and validators are legacy re-exports',()=>{
 const old=legacy.sample();assert.equal(validateProject(old).schemaVersion,1);const next=migrate(old);assert.equal(legacy.validateProject(next).schemaVersion,2);assert.deepEqual(next.nodes,old.nodes);assert.equal(legacy.validateProject,validateProject);
});
