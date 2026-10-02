import { LightningElement, api } from 'lwc';
import { componentDefinition } from 'c/builderModel';
export default class BuilderPropertyEditor extends LightningElement {
 @api node;
 get properties(){return (componentDefinition(this.node?.type)?.properties||[]).map(p=>({...p,label:p.label||p.key,value:this.node.props[p.key]??p.default,isSelect:p.type==='select',isTextarea:p.type==='textarea',isCheckbox:p.type==='checkbox',isInput:!['select','textarea','checkbox'].includes(p.type),options:(p.values||[]).map(value=>({value,selected:value===(this.node.props[p.key]??p.default)}))}));}
 change(event){const key=event.currentTarget.dataset.key;const property=componentDefinition(this.node.type).properties.find(p=>p.key===key);let value=event.target.value;if(property.type==='checkbox')value=event.target.checked;if(property.type==='number')value=Number(value);this.dispatchEvent(new CustomEvent('propertychange',{detail:{key,value}}));}
}
