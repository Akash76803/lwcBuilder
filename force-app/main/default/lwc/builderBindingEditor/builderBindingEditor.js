import {LightningElement,api} from 'lwc';
import {supportsValueBinding,selectionValue,valueType,compatibleValueTypes,stateTypes,parseStateValue} from 'c/builderBindingResolver';
export default class BuilderBindingEditor extends LightningElement {
 @api node;@api definitions=[];@api values={};newKey='';newType='Text';error='';
 get supported(){return supportsValueBinding(this.node);}get type(){return valueType(this.node);}
 get source(){return this.node.data.valueBinding?.source==='state'?'state':!selectionValue(this.node)&&(this.node.data.valueBinding?.source==='pack'||this.node.data.packBinding)?'pack':'static';}
 get sources(){return [{value:'static',label:'Static Value'},{value:'state',label:'State variable'},...(!selectionValue(this.node)?[{value:'pack',label:'Data Pack field'}]:[])].map(o=>({...o,selected:o.value===this.source}));}
 get isState(){return this.source==='state';}get isStatic(){return this.source==='static';}
 get stateOptions(){return this.definitions.filter(d=>compatibleValueTypes(this.node).includes(d.type)).map(d=>({...d,selected:d.key===this.node.data.valueBinding?.key}));}
 get noCompatible(){return !this.stateOptions.length;}get expected(){return 'Expected type: '+compatibleValueTypes(this.node).join(' / ');}
 get variables(){return this.definitions.map(d=>({...d,current:JSON.stringify(this.values[d.key])??'Not set'}));}
 get types(){return stateTypes.map(value=>({value,selected:value===this.newType}));}
 sourceChange(event){this.dispatchEvent(new CustomEvent('bindingchange',{detail:{source:event.target.value}}));}
 keyChange(event){this.dispatchEvent(new CustomEvent('bindingchange',{detail:{source:'state',key:event.target.value}}));}
 newKeyChange(event){this.newKey=event.target.value;}newTypeChange(event){this.newType=event.target.value;}
 changeDefault(event){try{const key=event.currentTarget.dataset.key,d=this.definitions.find(d=>d.key===key),defaultValue=parseStateValue(event.detail.value,d.type);this.error='';this.dispatchEvent(new CustomEvent('statechange',{detail:this.definitions.map(v=>v.key===key?{...v,defaultValue}:v)}));}catch(e){this.error=e.message;}}
 add(){const defaults={Text:'',Number:0,Boolean:false,Date:new Date().toISOString().slice(0,10),List:[],Object:{}};this.dispatchEvent(new CustomEvent('statechange',{detail:[...this.definitions,{key:this.newKey.trim(),type:this.newType,defaultValue:defaults[this.newType]}]}));}
 remove(event){this.dispatchEvent(new CustomEvent('statechange',{detail:this.definitions.filter(d=>d.key!==event.currentTarget.dataset.key)}));}
}
