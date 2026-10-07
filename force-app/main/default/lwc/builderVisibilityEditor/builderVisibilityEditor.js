import {LightningElement,api} from 'lwc';
import {visibilityOperators} from 'c/builderVisibilityModel';
export default class BuilderVisibilityEditor extends LightningElement{
 @api node;@api sources=[];
 get config(){return this.node.props.visibility||{mode:'always',match:'all',conditions:[]};}
 get modes(){return ['always','conditional','hidden'].map(value=>({value,label:{always:'Always visible',conditional:'Conditional',hidden:'Hidden'}[value],selected:this.config.mode===value}));}
 get conditional(){return this.config.mode==='conditional';}
 get legacy(){return !this.node.props.visibility&&this.node.rules.some(r=>r.effect==='Visible');}
 get matches(){return ['all','any'].map(value=>({value,label:value==='all'?'All conditions (AND)':'Any condition (OR)',selected:this.config.match===value}));}
 get rows(){return this.config.conditions.map(c=>({...c,options:this.sources.map(s=>({...s,selected:s.id===c.sourceId})),operators:visibilityOperators.map(value=>({value,selected:value===c.operator})),missing:!this.sources.some(s=>s.id===c.sourceId),needsValue:c.operator!=='blank'}));}
 emit(config){this.dispatchEvent(new CustomEvent('propertychange',{detail:{key:'visibility',value:config}}));}
 change(event){const {field,id}=event.target.dataset,value=event.target.value;const config=JSON.parse(JSON.stringify(this.config));if(id)config.conditions.find(c=>c.id===id)[field]=value;else config[field]=value;this.emit(config);}
 add(){const config=JSON.parse(JSON.stringify(this.config));config.conditions.push({id:'v'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),sourceId:this.sources[0]?.id||'',operator:'equals',value:''});this.emit(config);}
 remove(event){this.emit({...this.config,conditions:this.config.conditions.filter(c=>c.id!==event.currentTarget.dataset.id)});}
}
