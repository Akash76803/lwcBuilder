const {JSDOM}=require('jsdom'),fs=require('fs'),assert=require('assert/strict');
const dom=new JSDOM('<body></body>',{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.test'}),w=dom.window;
w.eval(fs.readFileSync(process.env.LWC_BUILDER_DOM_BUNDLE||__dirname+'/bundle.js','utf8'));
const app=w.mount(),tick=()=>new Promise(r=>setTimeout(r,20));
const deep=(root,s)=>{let a=[...root.querySelectorAll(s)];for(const e of root.querySelectorAll('*'))if(e.shadowRoot)a.push(...deep(e.shadowRoot,s));return a;};
(async()=>{await tick();const sr=app.shadowRoot;let exported;
w.Blob=class{constructor(parts){exported=JSON.parse(parts.join(''));}};w.URL.createObjectURL=()=> 'blob:test';w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=()=>{};
async function click(e){assert.ok(e,'Missing UI control');e.click();await tick();}
async function change(e,v,type='change'){assert.ok(e);if(e.type==='checkbox')e.checked=v;else e.value=v;e.dispatchEvent(new w.Event(type,{bubbles:true}));await tick();}
async function exp(){await click([...sr.querySelectorAll('button')].find(b=>b.textContent==='Export JSON'));return exported;}
await click(sr.querySelector('[data-type="tabs"]'));let p=await exp();const owner=p.nodes[0].children.find(n=>n.type==='tabs'),id=owner.id,first=owner.children[0].id;
const node=(root,id)=>deep(root,'c-builder-node').find(n=>n.node.id===id);
const set=()=>node(sr,id).shadowRoot;
assert.equal(owner.children.length,1);assert.equal(set().querySelectorAll('[role="tab"]').length,1);
await click(set().querySelector('.add-tab'));p=await exp();const second=p.nodes[0].children.find(n=>n.id===id).children[1].id;
assert.equal(set().querySelector('[role="tab"][aria-selected="true"]').dataset.id,second);
await click(sr.querySelector('[data-type="table"]'));p=await exp();let tab=p.nodes[0].children.find(n=>n.id===id).children[1];assert.equal(tab.children[0].type,'table');const tableId=tab.children[0].id;
const table=()=>deep(node(sr,tableId).shadowRoot,'c-builder-table')[0];const original=table();
await change(original.shadowRoot.querySelector('input[data-rowid="p1"][data-id="qty"]'),4,'input');
await change(original.shadowRoot.querySelector('input[data-rowid="p1"][type="checkbox"]'),true);
await click(set().querySelector(`[data-id="${first}"]`));assert.equal(set().querySelector(`#${id}-panel-${second}`).hidden,true);
await click(set().querySelector(`[data-id="${second}"]`));assert.equal(table(),original);assert.equal(table().shadowRoot.querySelector('input[data-rowid="p1"][data-id="qty"]').value,'4');assert.equal(table().shadowRoot.querySelector('input[data-rowid="p1"][type="checkbox"]').checked,true);
await change(sr.querySelector(`input[aria-label="Tab label"][data-id="${second}"]`),'Products');await change(sr.querySelector('.default-tab'),second);
await click(sr.querySelector(`button[data-id="${second}"][data-direction="-1"]`));p=await exp();tab=p.nodes[0].children.find(n=>n.id===id);assert.equal(tab.children[0].id,second);assert.equal(tab.props.defaultTabId,second);
await click([...sr.querySelectorAll('button[data-id="'+second+'"]')].find(b=>b.textContent==='Delete tab'));p=await exp();assert.equal(p.nodes[0].children.find(n=>n.id===id).children.length,1);
await click([...sr.querySelectorAll('button')].find(b=>b.textContent==='Undo'));p=await exp();assert.equal(p.nodes[0].children.find(n=>n.id===id).children[0].children[0].id,tableId);
await click(sr.querySelector('[data-modal="Preview"]'));const dialog=sr.querySelector('.dialog'),previewSet=()=>node(dialog,id).shadowRoot;
assert.equal(previewSet().querySelector('[aria-selected="true"]').dataset.id,second);assert.equal(previewSet().querySelector('.add-tab'),null);
const pt=deep(node(dialog,tableId).shadowRoot,'c-builder-table')[0];await change(pt.shadowRoot.querySelector('input[data-rowid="p1"][data-id="qty"]'),7,'input');await click(previewSet().querySelector(`[data-id="${first}"]`));await click(previewSet().querySelector(`[data-id="${second}"]`));assert.equal(deep(node(dialog,tableId).shadowRoot,'c-builder-table')[0],pt);assert.equal(pt.shadowRoot.querySelector('input[data-rowid="p1"][data-id="qty"]').value,'7');
const button=previewSet().querySelector(`[data-id="${second}"]`);button.dispatchEvent(new w.KeyboardEvent('keydown',{key:'End',bubbles:true}));await tick();assert.equal(previewSet().querySelector('[aria-selected="true"]').dataset.id,first);
await click(dialog.querySelector('header button'));
// Dropping into a tabset targets the active tab, never the root.
await click(set().querySelector(`[data-id="${first}"]`));
const drop=new w.Event('drop',{bubbles:true,cancelable:true});Object.defineProperty(drop,'dataTransfer',{value:{getData:()=> 'input'}});set().querySelector('article,section,.node').dispatchEvent(drop);await tick();p=await exp();let ownerNow=p.nodes[0].children.find(n=>n.id===id);assert.equal(ownerNow.children.find(n=>n.id===first).children[0].type,'input');
// A disabled default tab is inspectable in Design but unavailable in Preview.
await click(set().querySelector(`[data-id="${second}"]`));const pe=sr.querySelector('c-builder-property-editor');await change(pe.shadowRoot.querySelector('[data-key="disabled"]'),true);
await click(sr.querySelector('[data-modal="Preview"]'));const d2=sr.querySelector('.dialog'),s2=node(d2,id).shadowRoot;assert.equal(s2.querySelector('[aria-selected="true"]').dataset.id,first);assert.equal(s2.querySelector(`[data-id="${second}"]`).disabled,true);await click(d2.querySelector('header button'));
// Duplicating the tabset must translate its stored default ID.
node(sr,id).dispatchEvent(new w.CustomEvent('nodeselect',{detail:id,bubbles:true,composed:true}));await tick();await click([...sr.querySelectorAll('button')].find(b=>b.textContent==='Duplicate'));p=await exp();const copy=p.nodes[0].children.find(n=>n.type==='tabs'&&n.id!==id);assert.ok(copy.children.some(n=>n.id===copy.props.defaultTabId));assert.notEqual(copy.props.defaultTabId,second);
console.log('PASS Tabset initial tab, add, active canvas, table nesting/state preservation, rename/reorder/default, delete/Undo, Preview default/state, keyboard, drop target, disabled fallback and duplicated defaults');
})().catch(e=>{console.error(e);process.exitCode=1;});
