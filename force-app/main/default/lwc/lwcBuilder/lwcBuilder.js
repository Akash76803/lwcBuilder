import {supportsValueBinding,selectionValue,valueType,compatibleValueTypes,stateDefinitions} from 'c/builderBindingResolver';
import {resolveActiveTab} from 'c/builderTabModel';
import {migrate} from 'c/builderMigration';
import {createRuntimeCoordinator} from 'c/builderRuntimeCoordinator';
import { LightningElement } from 'lwc';
import {validateTableConfig,validateSummaryConfig} from 'c/builderTableModel';
import { clone, palette, sample, flatten, find, makeNode, insert, remove, move, parentOf, validateProject } from 'c/builderModel';
import { componentDefinition, canContain, validateInputConfig, validateInputValue, isSelectionType } from 'c/builderModel';
import { validatePackCollection, bindablePaths, resolveBinding } from 'c/builderDataPackModel';
export default class LwcBuilder extends LightningElement {
 project=migrate(sample()); selectedId='items'; active='Design'; inspector='Properties'; paletteTab='Components'; search=''; history=[]; future=[]; message='Phase 1 · Configuration and sample data only'; modal=''; prompt=''; logs=[]; aiMessages=[]; draftName=''; previewState={'Order Status':'Draft','Permission Can Edit Orders':'true'};
 runtime=createRuntimeCoordinator();runtimeRevision=0;tableColumnId='';
 adapterEvent(event){event.stopPropagation();this.runtime.dispatch(event.detail);this.runtimeRevision++;}
 get runtimePrefix(){return this.isPreview?'preview':'design';}
 requestTableBinding(){this.inspector='Bindings';}
 get isSummarySelected(){return this.selected?.type==='summaryTable';}get selectedSummary(){return find(this.boundNodes,this.selectedId);}get summarySources(){return this.runtime.sourcesForEditor(this.baseBoundNodes);}
 tabs=['Design','Data Packs','Data','Rules','Communication','Actions']; propTabs=['Properties','Bindings','Rules'];
 get navigation(){return this.tabs.map(label=>({label,cls:this.active===label?'nav active':'nav'}));}
 get propertyTabs(){return this.propTabs.map(label=>({label,cls:this.inspector===label?'nav active':'nav'}));}
 get isPacks(){return this.active==='Data Packs';} get showWorkspace(){return !this.isPacks;}
 get dataPacks(){return this.project.dataPacks||[];}
 packsChange(event){const packs=clone(event.detail);this.mutate(()=>{validatePackCollection(packs);this.project.dataPacks=packs;});}
 get stateVariables(){return stateDefinitions(this.project.state);}
 get designState(){this.runtime.configureState(this.project.state);return this.runtime.stateSnapshot('design');}
 get previewRuntimeState(){this.runtime.configureState(this.project.state);return {...this.previewState,...this.runtime.stateSnapshot('preview')};}
 get showPackConfig(){return !supportsValueBinding(this.selected)||selectionValue(this.selected)||this.valueSource==='pack';}
 get valueSource(){return this.selected?.data.valueBinding?.source==='state'?'state':this.selected?.data.valueBinding?.source==='pack'||this.selected?.data.packBinding?'pack':'static';}
 valueBindingChange(event){const {source,key}=event.detail;this.mutate(()=>{const n=this.selected;if(!selectionValue(n))delete n.data.packBinding;if(source==='state'){n.data.valueBinding={source:'state',key:key===undefined?this.stateVariables.find(d=>compatibleValueTypes(n).includes(d.type))?.key||'':key};}else{delete n.data.valueBinding;if(source==='pack'){n.data.valueBinding={source:'pack'};n.data.packBinding={packId:'',version:'',outputPath:'',inputValues:{}};}}});}
 stateDefinitionsChange(event){const definitions=clone(event.detail);this.mutate(()=>{this.project.state={...this.project.state,variables:definitions};});}
 valueChange(event){event.stopPropagation();try{this.runtime.writeBinding(event.detail);this.runtimeRevision++;}catch(e){this.record('State update rejected: '+e.message);}}
 get binding(){return this.selected?.data.packBinding||{};}
 get packOptions(){return this.dataPacks.map(p=>({id:p.id,name:p.name,selected:p.id===this.binding.packId}));}
 get bindingPack(){return this.dataPacks.find(p=>p.id===this.binding.packId);}
 get boundDefinition(){return this.bindingPack?.versions.find(v=>v.version===Number(this.binding.version))?.definition;}
 get versionOptions(){return (this.bindingPack?.versions||[]).map(v=>({value:v.version,selected:v.version===Number(this.binding.version)}));}
 get outputOptions(){const definition=this.boundDefinition;if(!definition)return [];const kind=this.selected.type==='table'?'List':componentDefinition(this.selected.type)?.binding||'Value';return bindablePaths(definition).filter(r=>r.kind===kind&&!r.bindingPath.includes('[]')).map(r=>({value:r.bindingPath,label:r.bindingPath,selected:r.bindingPath===this.binding.outputPath}));}
 get isTableSelected(){return this.selected?.type==='table';}
 get selectedTable(){return find(this.boundNodes,this.selectedId);}
 get tablePaths(){const prefix=(this.binding.outputPath||'')+'[].';return this.boundDefinition?bindablePaths(this.boundDefinition).filter(r=>r.kind==='Value'&&r.bindingPath.startsWith(prefix)&&!r.bindingPath.slice(prefix.length).includes('[]')).map(r=>r.bindingPath.slice(prefix.length)):[];}
 tableColumnSelect(event){this.selectedId=event.detail.nodeId;this.tableColumnId=event.detail.columnId;this.active='Design';this.inspector='Properties';}
 get selectedTabset(){if(this.selected?.type==='tabs')return this.selected;const parent=parentOf(this.project.nodes,this.selectedId);return this.selected?.type==='tab'&&parent?.type==='tabs'?parent:null;}
 get hasTabset(){return !!this.selectedTabset;}
 get tabRows(){return (this.selectedTabset?.children||[]).map((n,i,a)=>({id:n.id,label:n.label,isFirst:i===0,isLast:i===a.length-1,selected:n.id===this.selectedId}));}
 get defaultTabOptions(){const node=this.selectedTabset;const active=node?resolveActiveTab(node,node.props.defaultTabId):'';return (node?.children||[]).map(n=>({id:n.id,label:n.label,selected:n.id===active}));}
 get selectedTabKey(){return this.selected?.type==='tab'?this.selected.id:'';}
 tabAdd(event){event.stopPropagation();const parentId=typeof event.detail==='string'?event.detail:this.selectedTabset?.id;if(parentId)this.addType('tab',parentId);}
 tabSelect(event){this.selectedId=event.currentTarget.dataset.id;}
 tabLabel(event){const id=event.target.dataset.id,value=event.target.value;this.mutate(()=>{find(this.project.nodes,id).label=value;});}
 tabDefault(event){const id=this.selectedTabset.id,value=event.target.value;this.mutate(()=>{find(this.project.nodes,id).props.defaultTabId=value;});}
 tabReorder(event){const id=event.currentTarget.dataset.id,direction=Number(event.currentTarget.dataset.direction);this.mutate(()=>{const parent=parentOf(this.project.nodes,id),a=parent.children,i=a.findIndex(n=>n.id===id),j=i+direction;if(j>=0&&j<a.length)[a[i],a[j]]=[a[j],a[i]];});}
 tabDelete(event){const id=event.currentTarget.dataset.id;this.mutate(()=>{const parent=parentOf(this.project.nodes,id);remove(this.project.nodes,id);if(parent.props.defaultTabId===id)parent.props.defaultTabId=parent.children[0]?.id||'';if(!this.selected)this.selectedId=parent.id;});}
 get selectedComponent(){return componentDefinition(this.selected?.type)?.label||'';}
 get bindingInputs(){return (this.boundDefinition?.inputs||[]).map(i=>({...i,value:Object.prototype.hasOwnProperty.call(this.binding.inputValues||{},i.id)?this.binding.inputValues[i.id]:i.defaultValue??''}));}
 bindingChange(event){const field=event.target.dataset.field,value=event.target.value;this.mutate(()=>{const binding={...this.binding,[field]:value};if(field==='packId'){binding.version='';binding.outputPath='';binding.inputValues={};}if(field==='version'){binding.outputPath='';binding.inputValues={};}this.selected.data.packBinding=binding;});}
 bindingInputChange(event){const id=event.currentTarget.dataset.id,value=event.detail.value;this.mutate(()=>{this.selected.data.packBinding={...this.binding,inputValues:{...(this.binding.inputValues||{}),[id]:value}};});}
 clearBinding(){this.mutate(()=>{delete this.selected.data.packBinding;if(this.selected.data.valueBinding?.source==='pack')delete this.selected.data.valueBinding;});}
 get baseBoundNodes(){const nodes=clone(this.project.nodes);const visit=n=>{if(n.data.packBinding?.packId){try{const value=resolveBinding(this.dataPacks,n.data.packBinding);if(value===undefined)throw Error('Output path not found');n.data.boundSample=value;n.data.boundError='';if(n.type!=='summaryTable'&&n.type!=='table'&&n.type!=='form'&&!isSelectionType(n.type))n.props.value=typeof value==='object'?JSON.stringify(value):String(value??'');}catch(e){n.data.boundError=e.message;}}n.children.forEach(visit);};nodes.forEach(visit);return nodes;}
 get isDesign(){return this.active==='Design';} get isData(){return this.active==='Data'||(this.isDesign&&this.inspector==='Bindings');} get isRules(){return this.active==='Rules'||(this.isDesign&&this.inspector==='Rules');} get isCommunication(){return this.active==='Communication';} get isActions(){return this.active==='Actions';} get isProperties(){return this.isDesign&&this.inspector==='Properties';}
 get selected(){return find(this.project.nodes,this.selectedId);} get hasSelected(){return !!this.selected;} get selectedLabel(){return this.selected?.label||'Select a component';}
 get groups(){return [...new Set(palette.map(p=>p.group))].map(name=>({name,items:palette.filter(x=>x.group===name&&x.label.toLowerCase().includes(this.search.toLowerCase()))}));}
 get tree(){return flatten(this.project.nodes).map(n=>({...n,cls:n.id===this.selectedId?'tree-row chosen':'tree-row'}));}
 get parents(){return this.tree.filter(n=>componentDefinition(n.type)?.container&&n.id!==this.selectedId&&!find(this.selected?.children||[],n.id)&&canContain(n.type,this.selected?.type));}
 get isPalette(){return this.paletteTab==='Components';} get showModal(){return !!this.modal;} get isPreview(){return this.modal==='Preview';} get isNew(){return this.modal==='New project';} get isVersions(){return this.modal==='Versions';} get isDeploy(){return this.modal==='Generate & Deploy';} get isRow(){return this.modal==='Edit row';}
 get rules(){return this.selected?.rules||[];} get actions(){return this.selected?.actions||[];} get connections(){return this.selected?.connections||[];} get noRules(){return !this.rules.length;} get noActions(){return !this.actions.length;} get noConnections(){return !this.connections.length;}
 get boundNodes(){void this.runtimeRevision;this.runtime.configureState(this.project.state);return this.runtime.viewNodes(this.baseBoundNodes,'design');}
 get disableUndo(){return !this.history.length;} get disableRedo(){return !this.future.length;} get previewNodes(){void this.runtimeRevision;this.runtime.configureState(this.project.state);return this.runtime.viewNodes(this.baseBoundNodes,'preview');} get versions(){return this.project.versions||[];}
 get targets(){return [{label:'Record Page',value:'lightning__RecordPage'},{label:'App Page',value:'lightning__AppPage'},{label:'Home Page',value:'lightning__HomePage'},{label:'Quick Action',value:'lightning__RecordAction'}].map(t=>({...t,selected:t.value===this.project.target}));}
 id(){return `n${Date.now().toString(36)}${Math.random().toString(36).slice(2,7)}`;}
 record(text){this.logs=[{id:this.id(),text},...this.logs].slice(0,40);this.message=text;}
 mutate(fn){const before=clone(this.project);try{fn();validateProject(this.project);for(const n of flatten(this.project.nodes)){const node=find(this.project.nodes,n.id);if(node.type==='table'&&node.props.tableConfig)validateTableConfig(node.props.tableConfig);if(node.type==='summaryTable'&&node.props.summaryConfig)validateSummaryConfig(node.props.summaryConfig);}validatePackCollection(this.project.dataPacks);this.history=[...this.history,before].slice(-40);this.future=[];this.project=migrate(this.project);this.runtime.prepare(this.baseBoundNodes,this.runtimePrefix);this.record('Design updated · Export JSON to keep a durable copy');return true;}catch(e){this.project=before;this.ensureSelection();this.record(e.message);return false;}}
 nav(event){this.active=event.currentTarget.dataset.tab;} propTab(event){this.inspector=event.currentTarget.dataset.tab;} paletteMode(event){this.paletteTab=event.currentTarget.dataset.tab;}
 searchChange(event){this.search=event.target.value;} select(event){this.selectedId=event.detail;} treeSelect(event){this.selectedId=event.currentTarget.dataset.id;}
 add(event){this.addType(event.currentTarget.dataset.type);} addType(type,parentId){this.mutate(()=>{const n=makeNode(type,this.id());const selected=this.selected;let parent=parentId===undefined?(componentDefinition(selected?.type)?.container?selected.id:parentOf(this.project.nodes,this.selectedId)?.id):parentId;let container=find(this.project.nodes,parent);if(type==='tab'&&container?.type==='tab'){parent=parentOf(this.project.nodes,container.id)?.id;container=find(this.project.nodes,parent);}if(container?.type==='tabs'&&type!=='tab')parent=resolveActiveTab(container)||container.id;if(type==='tabs'){const tab=makeNode('tab',this.id());tab.label='Tab 1';n.children=[tab];n.props.defaultTabId=tab.id;}if(type==='tab'){const owner=find(this.project.nodes,parent);n.label=`Tab ${(owner?.children.length||0)+1}`;}insert(this.project.nodes,n,parent);this.selectedId=n.id;});}
 drag(event){event.dataTransfer.setData('text/plain',event.currentTarget.dataset.type);event.dataTransfer.effectAllowed='copy';} allow(event){event.preventDefault();} drop(event){event.preventDefault();this.acceptDrop(event.dataTransfer.getData('text/plain'),null);}
 treeDrag(event){event.dataTransfer.setData('text/plain',`node:${event.currentTarget.dataset.id}`);event.dataTransfer.effectAllowed='move';}
 acceptDrop(type,parentId){if(type.startsWith('node:')){const id=type.slice(5);this.mutate(()=>{const source=find(this.project.nodes,id),target=find(this.project.nodes,parentId);if(source?.type==='tab'&&target?.type==='tab')parentId=parentOf(this.project.nodes,target.id)?.id;move(this.project.nodes,id,parentId);this.selectedId=id;});}else this.addType(type,parentId);} nodeDrop(event){event.stopPropagation();this.acceptDrop(event.detail.type,event.detail.parentId);}
 propertyChange(event){const {key,value}=event.detail;this.mutate(()=>{const prop=componentDefinition(this.selected.type)?.properties.find(p=>p.key===key);if(prop?.type==='number'&&value!==''&&(!Number.isFinite(value)||value<prop.min||value>prop.max))throw Error(`${prop.label}: enter ${prop.min} to ${prop.max}`);this.selected.props[key]=value;if(key==='inputType'){this.selected.props.textFormat='any';this.selected.props.pattern='';}if(['input','search','price'].includes(this.selected.type)){validateInputConfig(this.selected);const error=validateInputValue(this.selected,this.selected.props.value,false);if(error){if(key==='inputType')this.selected.props.value=['checkbox','toggle'].includes(value)?false:'';else throw Error(error);}}});}
 change(event){const field=event.target.dataset.field,value=event.target.type==='number'?Number(event.target.value):event.target.value;this.mutate(()=>{if(field==='label')this.selected.label=value;else this.selected.props[field]=value;});}
 schemaChange(event){this.mutate(()=>{this.selected.data=clone(event.detail);});}
 dataChange(event){const field=event.target.dataset.field,value=event.target.value;this.mutate(()=>{this.selected.data[field]=value;});}
 targetChange(event){const target=event.target.value;this.mutate(()=>{this.project.target=target;});}
 projectName(event){const name=event.target.value;this.mutate(()=>{this.project.name=name;});}
 deleteNode(){this.mutate(()=>{remove(this.project.nodes,this.selectedId);this.selectedId=this.project.nodes[0]?.id;});}
 duplicate(){this.mutate(()=>{const n=clone(this.selected);const ids=new Map();const rekey=node=>{const old=node.id;node.id=this.id();ids.set(old,node.id);node.children.forEach(rekey);};rekey(n);const defaults=node=>{if(node.type==='tabs'&&node.props.defaultTabId)node.props.defaultTabId=ids.get(node.props.defaultTabId)||'';node.children.forEach(defaults);};defaults(n);n.label+=' Copy';const parentOf=(nodes,parent=null)=>{for(const node of nodes){if(node.id===this.selectedId)return {nodes,parent};const found=parentOf(node.children,node);if(found)return found;}return null;};const location=parentOf(this.project.nodes);location.nodes.splice(location.nodes.findIndex(x=>x.id===this.selectedId)+1,0,n);this.selectedId=n.id;});}
 moveTo(event){const parent=event.target.value;this.mutate(()=>move(this.project.nodes,this.selectedId,parent||null));}
 reorder(event){const direction=Number(event.currentTarget.dataset.direction);this.mutate(()=>{const reorder=nodes=>{const i=nodes.findIndex(n=>n.id===this.selectedId);if(i>=0){const next=i+direction;if(next>=0&&next<nodes.length)[nodes[i],nodes[next]]=[nodes[next],nodes[i]];return true;}return nodes.some(n=>reorder(n.children));};reorder(this.project.nodes);});}
 undo(){if(!this.history.length)return;this.future=[...this.future,clone(this.project)];this.project=migrate(this.history[this.history.length-1]);this.history=this.history.slice(0,-1);this.runtime.reset();this.ensureSelection();}
 redo(){if(!this.future.length)return;this.history=[...this.history,clone(this.project)];this.project=migrate(this.future[this.future.length-1]);this.future=this.future.slice(0,-1);this.runtime.reset();this.ensureSelection();}
 ensureSelection(){if(!this.selected)this.selectedId=this.project.nodes[0]?.id;}
 addRule(){this.mutate(()=>this.selected.rules.push({id:this.id(),field:'Order Status',operator:'equals',value:'Draft',effect:'Visible',join:'AND'}));}
 addAction(){this.mutate(()=>this.selected.actions.push({id:this.id(),type:'Validate',name:'Validate',error:'Stop'}));}
 addConnection(){this.mutate(()=>this.selected.connections.push({id:this.id(),event:'rowselect',target:'child.recordId',kind:'Parent to child',payload:'detail.recordId'}));}
 rowChange(event){const {collection,id,field}=event.target.dataset,value=event.target.value;this.mutate(()=>{this.selected[collection].find(r=>r.id===id)[field]=value;});}
 removeRow(event){const {collection,id}=event.currentTarget.dataset;this.mutate(()=>{this.selected[collection]=this.selected[collection].filter(r=>r.id!==id);});}
 actionMove(event){const {id,direction}=event.currentTarget.dataset;this.mutate(()=>{const a=this.selected.actions,i=a.findIndex(x=>x.id===id),j=i+Number(direction);if(j>=0&&j<a.length)[a[i],a[j]]=[a[j],a[i]];});}
 open(event){this.modal=event.currentTarget.dataset.modal;if(this.isPreview)this.runtime.reset('preview');this.draftName='';} close(){this.modal='';}
 newName(event){this.draftName=event.target.value;} create(){this.mutate(()=>{this.project={schemaVersion:1,name:this.draftName||'Untitled Project',target:'lightning__RecordPage',nodes:[],versions:[]};this.selectedId=null;});this.close();}
 save(){this.mutate(()=>{const snapshot=clone(this.project);snapshot.versions=[];this.project.versions=[...(this.project.versions||[]),{id:this.id(),name:`Revision ${(this.project.versions||[]).length+1}`,date:new Date().toISOString(),snapshot}].slice(-10);});this.download();this.record('Revision saved as JSON download · Server persistence connects later');}
 restore(event){const v=this.versions.find(x=>x.id===event.currentTarget.dataset.id);if(v)this.mutate(()=>{const versions=this.project.versions;this.project=migrate(v.snapshot);this.project.versions=versions;this.ensureSelection();});this.close();}
 download(){const text=JSON.stringify(this.project,null,2);const anchor=document.createElement('a');anchor.href=URL.createObjectURL(new Blob([text],{type:'application/octet-stream'}));anchor.download='lwc-builder-project.json';anchor.click();URL.revokeObjectURL(anchor.href);}
 importProject(event){const file=event.target.files?.[0];if(!file)return;if(file.size>2*1024*1024){this.record('Project file exceeds 2 MB');return;}const reader=new FileReader();reader.onload=()=>{try{const p=validateProject(migrate(JSON.parse(reader.result)));validatePackCollection(p.dataPacks);if(this.mutate(()=>{this.project=p;this.selectedId=p.nodes[0]?.id;})){this.runtime.reset();this.runtimeRevision++;}}catch(e){this.record(`Import rejected: ${e.message}`);}};reader.onerror=()=>this.record('Unable to read file');reader.readAsText(file);}
 promptChange(event){this.prompt=event.target.value;} ai(){if(!this.prompt.trim())return;this.aiMessages=[...this.aiMessages,{id:this.id(),text:this.prompt},{id:this.id(),text:'Demo assistant: prompt received. AI service is not connected. Configure the design using the editors; no automatic changes were applied.'}];this.prompt='';this.record('AI demo response · no API request made');}
 previewChange(event){this.previewState={...this.previewState,[event.detail.key]:event.detail.value};} statusChange(event){this.previewState={...this.previewState,'Order Status':event.target.value};}
 demoAction(event){this.modal='Edit row';this.record(`${event.detail}: sample action only; no Salesforce write`);} rowSave(){this.close();this.record('Sample popup closed · no record changes saved');}
}
