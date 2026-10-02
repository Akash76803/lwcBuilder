import { LightningElement, api } from 'lwc';
import describeObject from '@salesforce/apex/BuilderSchemaService.describeObject';
export default class BuilderFieldPathSelect extends LightningElement {
 _object=''; @api label='Field'; @api value=''; @api knownPaths=[]; @api restrictToKnown=false;
 fields=[]; search=''; loading=false; error=''; token=0; manualError='';
 @api get objectApiName(){return this._object;} set objectApiName(value){if(this._object===(value||''))return;this._object=value||'';this.fields=[];this.search='';if(this.isConnected)this.load();}
 connectedCallback(){this.load();}
 disconnectedCallback(){this.token++;}
 async load(){const token=++this.token;this.fields=[];this.error='';this.loading=false;if(!this._object)return;this.loading=true;try{const schema=await describeObject({objectApiName:this._object});if(token===this.token)this.fields=schema.fields||[];}catch(e){if(token===this.token)this.error=e?.body?.message||e?.message||'Unable to load readable fields';}finally{if(token===this.token)this.loading=false;}}
 get candidates(){const known=[...new Set((this.knownPaths||[]).filter(Boolean))];const map=new Map();for(const f of this.fields){if(!this.restrictToKnown||known.includes(f.apiName))map.set(f.apiName,{value:f.apiName,label:`${f.label} · ${f.apiName}`});}for(const path of known){if(!map.has(path))map.set(path,{value:path,label:path.includes('.')?`${path} · relationship path`:`${path} · configured field`});}return [...map.values()].sort((a,b)=>a.label.localeCompare(b.label));}
 get options(){const term=this.search.toLowerCase();const list=this.candidates.filter(o=>o.label.toLowerCase().includes(term));const current=this.candidates.find(o=>o.value===this.value);if(this.value&&!list.some(o=>o.value===this.value))list.unshift(current||{value:this.value,label:`${this.value} · saved path (verify)`});return list.map(o=>({...o,selected:o.value===this.value}));}
 get noFields(){return !this.loading&&!this.candidates.length;}get missingContext(){return !this._object&&!this.knownPaths?.length;}get selectedEmpty(){return !this.value;}
 searchChange(e){this.search=e.target.value;}
 choose(e){this.manualError='';this.dispatchEvent(new CustomEvent('fieldchange',{detail:{value:e.target.value}}));}
 manual(e){const value=e.target.value.trim();if(value&&!/^[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*$/.test(value)){this.manualError='Use a field API name or a dot-separated relationship path.';return;}this.manualError='';this.dispatchEvent(new CustomEvent('fieldchange',{detail:{value}}));}
}
