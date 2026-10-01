import { LightningElement, api } from 'lwc';
import listObjects from '@salesforce/apex/BuilderSchemaService.listObjects';
import describeObject from '@salesforce/apex/BuilderSchemaService.describeObject';
import { selectedFields, toggleField, changeObject, pathFor, relatedSource } from 'c/builderSchemaModel';
export default class BuilderSchemaPicker extends LightningElement {
 _data={}; schema; objects=[]; steps=[]; search=''; fieldSearch=''; nextOffset; error=''; busy=false; request=0;
 @api get data(){return this._data;} set data(value){const changed=this._data.object!==value?.object;this._data=value||{};if(changed){this.steps=[];if(this.isConnected)this.loadSchema(this._data.object);}}
 connectedCallback(){this.findObjects();if(this._data.object)this.loadSchema(this._data.object);}
 get objectName(){return this._data.object||'Choose an object';}
 get breadcrumb(){return [this.objectName,...this.steps.map(s=>s.relationshipName)].join(' → ');}
 get hasMore(){return this.nextOffset!==null&&this.nextOffset!==undefined;}
 get canBack(){return this.steps.length>0;}
 get fields(){const selected=selectedFields(this._data);return (this.schema?.fields||[]).filter(f=>(f.label+' '+f.apiName).toLowerCase().includes(this.fieldSearch.toLowerCase())).map(f=>({...f,path:pathFor(this.steps,f.apiName),checked:selected.includes(pathFor(this.steps,f.apiName))}));}
 get lookups(){return (this.schema?.fields||[]).filter(f=>f.relationshipName&&f.targets?.length).map(f=>({...f,disabled:f.targets.length!==1||this.steps.length>=5,target:f.targets[0].apiName,hint:f.targets.length!==1?'Polymorphic lookup: typed traversal requires runtime support':f.targets[0].label}));}
 get children(){return this.steps.length?[]:(this.schema?.children||[]);}
 get chosen(){return selectedFields(this._data).map(path=>({path}));}
 get source(){const s=this._data.relatedSource;return s?`${s.parentObject}.${s.relationshipName} via ${s.foreignKey} = ${s.parentValue}`:'';}
 get legacyFilter(){return this._data.filter||'';}
 emit(data){this.dispatchEvent(new CustomEvent('datachange',{detail:data}));}
 errorText(e){return e?.body?.message||e?.message||'Metadata request failed';}
 searchChange(e){this.search=e.target.value;}
 fieldSearchChange(e){this.fieldSearch=e.target.value;}
 async findObjects(){await this.fetchObjects(0);}
 async more(){await this.fetchObjects(this.nextOffset);}
 async fetchObjects(offset){this.busy=true;this.error='';try{const result=await listObjects({searchTerm:this.search,offset});this.objects=offset?[...this.objects,...result.objects]:result.objects;this.nextOffset=result.nextOffset;}catch(e){this.error=this.errorText(e);}finally{this.busy=false;}}
 async loadSchema(name){const token=++this.request;this.schema=undefined;this.error='';if(!name)return;this.busy=true;try{const result=await describeObject({objectApiName:name});if(token===this.request)this.schema=result;}catch(e){if(token===this.request)this.error=this.errorText(e);}finally{if(token===this.request)this.busy=false;}}
 chooseObject(e){this.steps=[];this.fieldSearch='';this.emit(changeObject(this._data,e.currentTarget.dataset.name));}
 selectField(e){this.emit(toggleField(this._data,e.target.dataset.path,e.target.checked));}
 removeField(e){this.emit(toggleField(this._data,e.currentTarget.dataset.path,false));}
 explore(e){const f=this.lookups.find(x=>x.apiName===e.currentTarget.dataset.name);if(!f||f.disabled)return;this.steps=[...this.steps,{relationshipName:f.relationshipName,objectApiName:f.target}];this.fieldSearch='';this.loadSchema(f.target);}
 back(){this.steps=this.steps.slice(0,-1);this.fieldSearch='';this.loadSchema(this.steps.at(-1)?.objectApiName||this._data.object);}
 child(e){const c=this.children.find(x=>x.relationshipName===e.currentTarget.dataset.name);if(!c)return;this.emit({...changeObject(this._data,c.objectApiName),relatedSource:relatedSource(this._data.object,c)});}
 filterChange(e){this.emit({...this._data,filter:e.target.value});}
}
