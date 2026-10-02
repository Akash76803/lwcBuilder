import { LightningElement, api } from 'lwc';
import { newPack, examplePack, newOutput, outputRows, findOutput, removeOutput, validatePack, runSample, publishSampleVersion, valueTypes } from 'c/builderDataPackModel';
const clone=v=>JSON.parse(JSON.stringify(v));
export default class BuilderDataPackDesigner extends LightningElement {
 _packs=[];packId='';selection='output';selectionId='';message='';issues=[];preview='';execution=[];testValues={};previewTab='Output';
 @api get packs(){return this._packs;} set packs(value){this._packs=value||[];if(!this._packs.some(p=>p.id===this.packId)){this.packId=this._packs[0]?.id||'';this.selection='output';this.selectionId=this.pack?.output.id||'';}this.clearResult();}
 get pack(){return this._packs.find(p=>p.id===this.packId);}
 get hasPack(){return !!this.pack;}
 get choices(){return this._packs.map(p=>({id:p.id,name:p.name,selected:p.id===this.packId}));}
 get isInput(){return this.selection==='input';}get isSource(){return this.selection==='source';}get isOutput(){return this.selection==='output';}
 get selected(){if(!this.pack)return null;if(this.isInput)return this.pack.inputs.find(i=>i.id===this.selectionId);if(this.isSource)return this.pack.sources.find(s=>s.id===this.selectionId);return findOutput(this.pack.output,this.selectionId)||this.pack.output;}
 get hasSelection(){return !!this.selected;}get inputs(){return this.pack?.inputs||[];}get sources(){return this.pack?.sources||[];}
 get tree(){return this.pack?outputRows(this.pack.output).map(r=>({...r,cls:r.id===this.selectionId&&this.isOutput?'tree-row chosen':'tree-row'})):[];}
 get noInputs(){return !this.inputs.length;}get noSources(){return !this.sources.length;}
 get isValue(){return this.isOutput&&this.selected?.kind==='Value';}get isContainer(){return this.isOutput&&!this.isValue;}get isList(){return this.selected?.kind==='List';}
 get canDeleteOutput(){return this.isOutput&&this.selected?.id!==this.pack?.output.id;}
 get fieldMode(){return this.selected?.mode==='field';}get inputMode(){return this.selected?.mode==='input';}get constantMode(){return this.selected?.mode==='constant';}get countMode(){return this.selected?.mode==='count';}
 get types(){return valueTypes.map(value=>({value,selected:value===this.selected?.type}));}
 get modes(){return [{value:'field',label:'Source field'},{value:'input',label:'Input value'},{value:'constant',label:'Constant'},{value:'count',label:'Source record count'}].map(v=>({...v,selected:v.value===this.selected?.mode}));}
 get sourceOptions(){return this.sources.map(s=>({value:s.id,label:s.name,selected:s.id===this.selected?.sourceId}));}
 get inputOptions(){return this.inputs.map(i=>({value:i.id,label:i.name,selected:i.id===this.selected?.inputId}));}
 get isRoot(){return this.isOutput&&this.selected?.id===this.pack?.output.id;}
 clearRelated(){const id=this.selectionId;this.mutate(p=>p.sources.find(s=>s.id===id).relatedSource=null);}
 get hasJoin(){return !!this.selected?.matchField;}get mappingTitle(){return this.selected?.name||'Select a node';}
 get versionLabel(){return this.pack?.versions.length?`Draft · latest v${this.pack.versions.at(-1).version}`:'Draft · unpublished';}
 get versions(){return this.pack?.versions.map(v=>({version:v.version,date:v.date}))||[];}
 get filters(){return (this.selected?.filters||[]).map(f=>({...f,ops:['equals','not equals','contains','greater than','blank'].map(value=>({value,selected:value===f.operator})),kinds:['constant','input'].map(value=>({value,selected:value===f.valueKind})),isInput:f.valueKind==='input',inputOptions:this.inputs.map(i=>({value:i.id,label:i.name,selected:i.id===f.value}))}));}
 get sortOptions(){return ['ASC','DESC'].map(value=>({value,selected:value===this.selected?.sortDirection}));}
 get fieldSource(){const current=this.selected;if(!current)return {};let id=current.sourceId;if(this.isValue&&this.fieldMode)id=[...this.ancestors(current.id)].reverse().find(n=>n.sourceId)?.sourceId;return this.sources.find(s=>s.id===id)||{};}
 get parentSource(){const id=[...this.ancestors(this.selected?.id)].reverse().find(n=>n.sourceId)?.sourceId;return this.sources.find(s=>s.id===id)||{};}
 get sourcePaths(){return this.paths(this.isSource?this.selected:this.fieldSource);}
 get parentPaths(){return this.paths(this.parentSource);}
 paths(source){return source?.selectedFields||String(source?.fields||'').split(',').map(x=>x.trim()).filter(Boolean);}
 fieldSelection(e){const field=e.currentTarget.dataset.field,value=e.detail.value,id=this.selectionId,kind=this.selection,sourceId=this.fieldSource.id,fromTraversal=e.detail.fromTraversal;this.mutate(p=>{const row=kind==='source'?p.sources.find(s=>s.id===id):findOutput(p.output,id);row[field]=value;if(kind==='output'&&field==='field'&&fromTraversal&&sourceId){const source=p.sources.find(s=>s.id===sourceId);const paths=this.paths(source);source.selectedFields=[...new Set([...paths,value])];source.fields=source.selectedFields.join(', ');}});}
 filterFieldSelection(e){const id=this.selectionId,fid=e.currentTarget.dataset.id,value=e.detail.value;this.mutate(p=>p.sources.find(s=>s.id===id).filters.find(f=>f.id===fid).field=value);}
 get sampleInputs(){return this.inputs.map(i=>({...i,value:Object.prototype.hasOwnProperty.call(this.testValues,i.id)?this.testValues[i.id]:i.defaultValue??''}));}
 get tabs(){return ['Output','Validation','Execution'].map(label=>({label,cls:this.previewTab===label?'preview-tab active':'preview-tab'}));}
 get showOutput(){return this.previewTab==='Output';}get showValidation(){return this.previewTab==='Validation';}get showExecution(){return this.previewTab==='Execution';}get noIssues(){return !this.issues.length;}
 get indexedIssues(){return this.issues.map((i,index)=>({...i,key:String(index)}));}
 id(){return 'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
 clearResult(){this.preview='';this.execution=[];this.issues=[];this.message='';}
 emit(packs){this.dispatchEvent(new CustomEvent('packschange',{detail:packs}));}
 changePack(e){this.packId=e.target.value;this.selection='output';this.selectionId=this.pack?.output.id;this.testValues={};this.clearResult();}
 create(){const p=newPack(this.id());this.packId=p.id;this.selection='output';this.selectionId=p.output.id;this.emit([...this._packs,p]);}
 example(){const p=examplePack(this.id());this.packId=p.id;this.selection='output';this.selectionId=p.output.id;this.emit([...this._packs,p]);}
 mutate(fn){try{const packs=clone(this._packs);const p=packs.find(x=>x.id===this.packId);fn(p);this.clearResult();this.emit(packs);}catch(e){this.message=e.message;}}
 packChange(e){const field=e.target.dataset.field,value=e.target.value;this.mutate(p=>p[field]=value);}
 select(e){this.selection=e.currentTarget.dataset.kind;this.selectionId=e.currentTarget.dataset.id;}
 addInput(){const id=this.id();this.selection='input';this.selectionId=id;this.mutate(p=>p.inputs.push({id,name:'input'+(p.inputs.length+1),type:'Text',required:false,defaultValue:''}));}
 addSource(){const id=this.id();this.selection='source';this.selectionId=id;this.mutate(p=>p.sources.push({id,name:'Source'+(p.sources.length+1),object:'',fields:'',selectedFields:[],filter:'',filters:[],sortField:'',sortDirection:'ASC',limit:100,sampleJson:'[]'}));}
 ancestors(id){const visit=(n,chain)=>{if(n.id===id)return chain;for(const c of n.children){const found=visit(c,[...chain,n]);if(found)return found;}return null;};return visit(this.pack.output,[])||[];}
 addOutput(e){const kind=e.currentTarget.dataset.kind,id=this.id();const current=this.isOutput?this.selected:this.pack.output;const parent=current.kind==='Value'?this.ancestors(current.id).at(-1):current;this.mutate(p=>{const target=findOutput(p.output,parent.id);const node=newOutput(id,kind);node.name=(kind==='Object'?'object':kind==='List'?'items':'value')+(target.children.length+1);target.children.push(node);});this.selection='output';this.selectionId=id;}
 typedChange(e){const field=e.currentTarget.dataset.field,value=e.detail.value;const id=this.selectionId,kind=this.selection;this.mutate(p=>{const row=kind==='input'?p.inputs.find(i=>i.id===id):findOutput(p.output,id);row[field]=value;});}
 selectedChange(e){const field=e.target.dataset.field,value=e.target.type==='checkbox'?e.target.checked:e.target.value;const kind=this.selection,id=this.selectionId;this.mutate(p=>{const row=kind==='input'?p.inputs.find(i=>i.id===id):kind==='source'?p.sources.find(s=>s.id===id):findOutput(p.output,id);row[field]=field==='limit'?Number(value):value;if(kind==='output'&&row.kind==='Value'&&field==='mode'&&value!=='count')row.sourceId='';});}
 schemaChange(e){const id=this.selectionId;this.mutate(p=>{const i=p.sources.findIndex(s=>s.id===id);p.sources[i]={...p.sources[i],...clone(e.detail)};});}
 removeSelected(){const kind=this.selection,id=this.selectionId;this.mutate(p=>{if(kind==='input')p.inputs=p.inputs.filter(i=>i.id!==id);else if(kind==='source')p.sources=p.sources.filter(s=>s.id!==id);else removeOutput(p.output,id);});this.selection='output';this.selectionId=this.pack.output.id;}
 addFilter(){const id=this.selectionId;this.mutate(p=>p.sources.find(s=>s.id===id).filters.push({id:this.id(),field:'',operator:'equals',valueKind:'constant',value:''}));}
 filterChange(e){const id=this.selectionId,fid=e.target.dataset.id,field=e.target.dataset.field,value=e.target.value;this.mutate(p=>{const f=p.sources.find(s=>s.id===id).filters.find(x=>x.id===fid);f[field]=value;if(field==='valueKind')f.value='';});}
 removeFilter(e){const id=this.selectionId,fid=e.currentTarget.dataset.id;this.mutate(p=>{const source=p.sources.find(s=>s.id===id);source.filters=source.filters.filter(f=>f.id!==fid);});}
 testChange(e){this.testValues={...this.testValues,[e.currentTarget.dataset.id]:e.detail.value};this.clearResult();}
 previewSwitch(e){this.previewTab=e.currentTarget.dataset.tab;}
 validate(){try{this.issues=validatePack(this.pack);this.message=this.issues.length?'Fix validation issues before running preview.':'Configuration validated.';this.previewTab='Validation';}catch(e){this.message=e.message;}}
 run(){try{const result=runSample(this.pack,this.testValues);this.preview=JSON.stringify(result.output,null,2);this.execution=result.execution;this.issues=[];this.message='Sample preview passed · No org records queried';this.previewTab='Output';}catch(e){this.preview='';this.execution=[];this.message=e.message;this.issues=[{path:'Preview',message:e.message}];this.previewTab='Validation';}}
 publish(){try{const updated=publishSampleVersion(this.pack,this.testValues);this.emit(this._packs.map(p=>p.id===updated.id?updated:p));this.message='Published local sample version. Save JSON to retain it. Live runtime is pending.';}catch(e){this.message=e.message;this.previewTab='Validation';this.issues=[{path:'Publish',message:e.message}];}}
}
