import { LightningElement, api } from 'lwc';
import describeObject from '@salesforce/apex/BuilderSchemaService.describeObject';
export default class BuilderFieldPathSelect extends LightningElement {
 _object=''; _value=''; @api label='Field'; @api knownPaths=[]; @api restrictToKnown=false;
 fields=[]; search=''; loading=false; error=''; token=0; manualError=''; cache=new Map();
 expanded=false; steps=[]; browseFields=[]; browseSearch=''; browseLoading=false; browseError=''; browseToken=0; draftPath=''; draftType=''; focusStart=false; opener;
 @api get value(){return this._value;} set value(value){if(this._value!==(value||'')){this._value=value||'';this.close(false);}}
 @api get objectApiName(){return this._object;} set objectApiName(value){if(this._object===(value||''))return;this.close(false);this._object=value||'';this.fields=[];this.search='';this.cache.clear();if(this.isConnected)this.load();}
 connectedCallback(){this.load();}
 disconnectedCallback(){this.token++;this.browseToken++;}
 async schema(name){if(this.cache.has(name))return this.cache.get(name);const schema=await describeObject({objectApiName:name});this.cache.set(name,schema);return schema;}
 async load(){const token=++this.token;this.fields=[];this.error='';this.loading=false;if(!this._object)return;this.loading=true;try{const schema=await this.schema(this._object);if(token===this.token)this.fields=schema.fields||[];}catch(e){if(token===this.token)this.error=this.errorText(e);}finally{if(token===this.token)this.loading=false;}}
 errorText(e){return e?.body?.message||e?.message||'Unable to load readable fields';}
 get candidates(){const known=[...new Set((this.knownPaths||[]).filter(Boolean))];const map=new Map();for(const f of this.fields){if(!this.restrictToKnown||known.includes(f.apiName))map.set(f.apiName,{value:f.apiName,label:`${f.label} · ${f.apiName}`});}for(const path of known){if(!map.has(path))map.set(path,{value:path,label:path.includes('.')?`${path} · relationship path`:`${path} · configured field`});}return [...map.values()].sort((a,b)=>a.label.localeCompare(b.label));}
 get options(){const term=this.search.toLowerCase();const list=this.candidates.filter(o=>o.label.toLowerCase().includes(term));const current=this.candidates.find(o=>o.value===this.value);if(this.value&&!list.some(o=>o.value===this.value))list.unshift(current||{value:this.value,label:`${this.value} · saved path (verify)`});return list.map(o=>({...o,selected:o.value===this.value}));}
 get noFields(){return !this.loading&&!this.candidates.length;}get missingContext(){return !this._object&&!this.knownPaths?.length;}get selectedEmpty(){return !this.value;}get disableBrowse(){return !this._object;}
 searchChange(e){this.search=e.target.value;}
 choose(e){this.manualError='';this.dispatchEvent(new CustomEvent('fieldchange',{detail:{value:e.target.value}}));}
 manual(e){const value=e.target.value.trim();if(value&&!/^[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*$/.test(value)){this.manualError='Use a field API name or a dot-separated relationship path.';return;}this.manualError='';this.dispatchEvent(new CustomEvent('fieldchange',{detail:{value}}));}
 get currentObject(){return this.steps.at(-1)?.objectApiName||this._object;}
 get breadcrumb(){return [this._object,...this.steps.map(s=>s.relationshipName)].join(' › ');}
 get pathNodes(){return [{id:'root',index:-1,label:this._object,object:this._object},...this.steps.map((s,index)=>({id:String(index),index,label:s.relationshipName,object:s.objectApiName}))].map((s,index)=>({...s,cls:index===this.steps.length?'path-node active':'path-node'}));}
 get canBack(){return this.steps.length>0;}get depth(){return this.steps.length;}
 path(field){return [...this.steps.map(s=>s.relationshipName),field].join('.');}
 get browseRows(){const term=this.browseSearch.toLowerCase();return this.browseFields.filter(f=>(f.label+' '+f.apiName).toLowerCase().includes(term)).map(f=>({...f,path:this.path(f.apiName),checked:this.path(f.apiName)===this.draftPath}));}
 get parentLookups(){const term=this.browseSearch.toLowerCase();return this.browseFields.filter(f=>f.relationshipName&&f.targets?.length&&(f.label+' '+f.relationshipName).toLowerCase().includes(term)).map(f=>({...f,disabled:f.targets.length!==1||this.steps.length>=5,hint:f.targets.length!==1?'Polymorphic lookup: typed traversal is pending':this.steps.length>=5?'Maximum 5 lookup hops reached':f.targets[0].label}));}
 get noBrowseFields(){return !this.browseLoading&&!this.browseError&&!this.browseRows.length;}
 get noLookups(){return !this.browseLoading&&!this.browseError&&!this.parentLookups.length;}
 get disableUse(){return !this.draftPath||this.browseLoading||!!this.browseError;}
 open(e){this.opener=e.currentTarget;this.expanded=true;this.steps=[];this.draftPath='';this.draftType='';this.browseSearch='';this.focusStart=true;this.loadBrowse();}
 renderedCallback(){if(this.focusStart&&this.expanded){this.focusStart=false;this.template.querySelector('.browse-search')?.focus();}}
 close(restore=true){this.expanded=false;this.browseToken++;this.browseLoading=false;if(restore)this.opener?.focus();}
 cancel(){this.close();}
 async loadBrowse(){const name=this.currentObject,token=++this.browseToken;this.browseFields=[];this.browseLoading=true;this.browseError='';try{const schema=await this.schema(name);if(token===this.browseToken&&this.expanded)this.browseFields=schema.fields||[];}catch(e){if(token===this.browseToken&&this.expanded)this.browseError=this.errorText(e);}finally{if(token===this.browseToken)this.browseLoading=false;}}
 retry(){this.cache.delete(this.currentObject);this.loadBrowse();}
 browseSearchChange(e){this.browseSearch=e.target.value;}
 selectDraft(e){const f=this.browseFields.find(f=>f.apiName===e.target.value);if(!f)return;this.draftPath=this.path(f.apiName);this.draftType=f.type;}
 explore(e){const f=this.parentLookups.find(f=>f.apiName===e.currentTarget.dataset.name);if(!f||f.disabled)return;this.steps=[...this.steps,{relationshipName:f.relationshipName,objectApiName:f.targets[0].apiName}];this.browseSearch='';this.draftPath='';this.draftType='';this.loadBrowse();}
 back(){if(!this.canBack)return;this.jumpTo(this.steps.length-2);}
 jump(e){this.jumpTo(Number(e.currentTarget.dataset.index));}
 jumpTo(index){this.steps=this.steps.slice(0,index+1);this.browseSearch='';this.draftPath='';this.draftType='';this.loadBrowse();}
 use(){if(this.disableUse)return;const detail={value:this.draftPath,type:this.draftType,rootObject:this._object,fromTraversal:true};this.close();this.dispatchEvent(new CustomEvent('fieldchange',{detail}));}
 modalKey(e){if(e.key==='Escape'){e.preventDefault();e.stopPropagation();this.cancel();return;}if(e.key!=='Tab')return;const dialog=this.template.querySelector('.dialog');const controls=[...dialog.querySelectorAll('button,input,select,textarea')].filter(el=>!el.disabled);const first=controls[0],last=controls.at(-1),active=this.template.activeElement;if(e.shiftKey&&active===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&active===last){e.preventDefault();first?.focus();}}
}
