import { LightningElement, api } from 'lwc';
import { componentDefinition, inputProperties } from 'c/builderModel';
export default class BuilderPropertyEditor extends LightningElement {
 @api node;
 get properties(){return (['input','search','price'].includes(this.node?.type)?inputProperties(this.node):componentDefinition(this.node?.type)?.properties||[]).map(p=>({...p,label:p.label||p.key,value:this.node.props[p.key]??p.default,isSelect:p.type==='select',isTextarea:p.type==='textarea',isCheckbox:p.type==='checkbox',isInput:!['select','textarea','checkbox'].includes(p.type),options:(p.values||[]).map(value=>({value,selected:value===(this.node.props[p.key]??p.default)}))}));}
 change(event){const key=event.currentTarget.dataset.key;const property=componentDefinition(this.node.type).properties.find(p=>p.key===key);let value=event.target.value;const effective=inputProperties(this.node).find(p=>p.key===key)||property;if(effective.type==='checkbox')value=event.target.checked;if(effective.type==='number')value=value===''&&effective.optional?'':Number(value);this.dispatchEvent(new CustomEvent('propertychange',{detail:{key,value}}));}
}
