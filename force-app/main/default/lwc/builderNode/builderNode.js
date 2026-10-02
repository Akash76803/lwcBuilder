import { LightningElement, api } from 'lwc';
import { visible } from 'c/builderModel';
export default class BuilderNode extends LightningElement {
 @api node; @api selectedId; @api preview=false; @api state;
 get shown(){return !this.preview||visible(this.node,this.state||{});}
 get boxClass(){return `node ${this.node.id===this.selectedId&&!this.preview?'selected':''}`;}
 get style(){return `padding:${Number(this.node.props.padding)||0}px;`;} 
 get isContainer(){return ['section','grid','tabs','modal','form'].includes(this.node.type);}
 get isForm(){return this.node.type==='form';} get isTabs(){return this.node.type==='tabs';} get isModal(){return this.node.type==='modal';}
 get childrenClass(){return ['grid','form'].includes(this.node.type)?'children grid':'children';}
 get hasPackBinding(){return !!this.node.data.packBinding?.packId;} get bindingError(){return this.node.data.boundError;} get hasBoundTable(){return this.isTable&&this.hasPackBinding&&!this.bindingError;} get boundJson(){return JSON.stringify(this.node.data.boundSample,null,2);}
 get boundColumns(){const rows=Array.isArray(this.node.data.boundSample)?this.node.data.boundSample:[];return [...new Set(rows.flatMap(r=>Object.keys(r||{})))].map(key=>({key,label:key}));}
 get noBoundRows(){return !this.boundRows.length;}
 get boundRows(){const rows=Array.isArray(this.node.data.boundSample)?this.node.data.boundSample:[];return rows.map((r,index)=>({key:String(index),cells:this.boundColumns.map(c=>({key:c.key,value:typeof r[c.key]==='object'?JSON.stringify(r[c.key]):String(r[c.key]??'')}))}));}
 get isTable(){return this.node.type==='table';} get isButton(){return this.node.type==='button';} get isSearch(){return this.node.type==='search';}
 get isChild(){return this.node.type==='child';} get isCombo(){return this.node.type==='combobox';}
 get isInput(){return ['input','lookup','price'].includes(this.node.type);} get label(){return this.node.label;}
 get value(){return this.node.props.value;} get readonly(){return this.node.props.mode==='read';}
 get tag(){return `${this.node.type} · ${this.node.id}`;}
 select(event){event.stopPropagation();if(!this.preview)this.dispatchEvent(new CustomEvent('nodeselect',{detail:this.node.id,bubbles:true,composed:true}));}
 drop(event){event.preventDefault();event.stopPropagation();if(!this.preview)this.dispatchEvent(new CustomEvent('nodedrop',{detail:{parentId:this.isContainer?this.node.id:null,type:event.dataTransfer.getData('text/plain')},bubbles:true,composed:true}));}
 allow(event){if(!this.preview)event.preventDefault();}
 previewChange(event){if(this.preview)this.dispatchEvent(new CustomEvent('previewchange',{detail:{key:this.node.label,value:event.target.value},bubbles:true,composed:true}));}
 action(event){event.stopPropagation();this.dispatchEvent(new CustomEvent('demoaction',{detail:this.node.label,bubbles:true,composed:true}));}
}
