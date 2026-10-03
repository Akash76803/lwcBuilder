import { LightningElement, api } from 'lwc';
import { componentDefinition, effectiveInputType, inputPattern, validateInputValue, isSelectionType } from 'c/builderModel';
import {resolveActiveTab,tabForSelection} from 'c/builderTabModel';
import { visible } from 'c/builderModel';
export default class BuilderNode extends LightningElement {
 activeTab=''; collapsed=false;
 @api runtime; @api node; @api selectedId; @api preview=false; @api state;
 get shown(){return !this.preview||visible(this.node,this.state||{});}
 get boxClass(){return `node ${this.node.id===this.selectedId&&!this.preview?'selected':''}`;}
 get style(){return `padding:${Number(this.node.props.padding)||0}px;`;} 
 get isContainer(){return !!componentDefinition(this.node.type)?.container;}
 get isForm(){return this.node.type==='form';} get isTabs(){return this.node.type==='tabs';} get isModal(){return this.node.type==='modal';}
 get childrenClass(){return ['grid','form','recordEditForm','recordViewForm'].includes(this.node.type)?'children grid':'children';}
 get childrenStyle(){return `grid-template-columns:repeat(${Math.min(4,Math.max(1,Number(this.node.props.columns)||2))},minmax(0,1fr));gap:${Math.min(48,Math.max(0,Number(this.node.props.gap)||0))}px;`;}
 get isAccordionSection(){return this.node.type==='accordionSection';}
 get showChildren(){return !this.preview||!this.isAccordionSection||!this.collapsed;}
 get expanded(){return !this.collapsed;}
 toggleSection(event){event.stopPropagation();this.collapsed=!this.collapsed;}
 get emptyContainer(){return !this.node.children.length;}
 get designMode(){return !this.preview;}
 get resolvedTab(){const eligible=n=>!this.preview||(visible(n,this.state||{})&&!n.props.disabled);return resolveActiveTab(this.node,!this.preview?tabForSelection(this.node,this.selectedId)||this.activeTab:this.activeTab,eligible);}
 get tabPanels(){const active=this.resolvedTab;return this.node.children.map(node=>({id:node.id,node,hidden:node.id!==active,panelId:`${this.node.id}-panel-${node.id}`,tabId:`${this.node.id}-tab-${node.id}`}));}
 get noAvailableTabs(){return this.isTabs&&!this.resolvedTab;}
 addTab(event){event.stopPropagation();this.dispatchEvent(new CustomEvent('tabadd',{detail:this.node.id,bubbles:true,composed:true}));}
 tabKey(event){const keys=['ArrowLeft','ArrowRight','Home','End'];if(!keys.includes(event.key))return;event.preventDefault();event.stopPropagation();const tabs=this.tabOptions.filter(t=>!t.disabled);let index=tabs.findIndex(t=>t.id===event.currentTarget.dataset.id);index=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;const tab=tabs[index];if(tab){this.activateTab(tab.id);this.template.querySelector(`[data-tab-id="${tab.id}"]`)?.focus();}}
 activateTab(id){this.activeTab=id;if(!this.preview)this.dispatchEvent(new CustomEvent('nodeselect',{detail:id,bubbles:true,composed:true}));}
 get disabled(){return !!this.node.props.disabled;} get required(){return !!this.node.props.required;}
 get placeholder(){return this.node.props.placeholder||'';}
 get inputType(){const type=effectiveInputType(this.node);return type==='phone'?'tel':type==='datetime-local'?'datetime':type;}
 get isBaseInput(){return ['input','search','price'].includes(this.node.type);}
 get inputMin(){return ['number','date','datetime','time'].includes(this.inputType)?(this.node.props.min!==''?this.node.props.min:undefined):undefined;}
 get inputMax(){return ['number','date','datetime','time'].includes(this.inputType)?(this.node.props.max!==''?this.node.props.max:undefined):undefined;}
 get inputStep(){return this.inputType==='number'?this.node.props.step||'1':undefined;}
 get inputPattern(){return !['number','date','datetime','time','toggle','checkbox'].includes(this.inputType)?inputPattern(this.node)||undefined:undefined;}
 get minLength(){return !['number','date','datetime','time','toggle','checkbox'].includes(this.inputType)?(this.node.props.minLength!==''?this.node.props.minLength:undefined):undefined;}
 get maxLength(){return !['number','date','datetime','time','toggle','checkbox'].includes(this.inputType)?(this.node.props.maxLength!==''?this.node.props.maxLength:undefined):undefined;}
 inputChange(event){const control=event.target;const value=['checkbox','toggle'].includes(this.inputType)?control.checked:control.value;const error=validateInputValue(this.node,value);control.setCustomValidity(error);if(!control.reportValidity()||error)return;if(this.preview)this.dispatchEvent(new CustomEvent('previewchange',{detail:{key:this.node.label,value},bubbles:true,composed:true}));}
 inputBlur(event){this.inputChange(event);}
 get checked(){return this.value===true||this.value==='true';}
 get isTextarea(){return ['textarea','richText'].includes(this.node.type);}
 get rows(){return Number(this.node.props.rows)||3;}
 get isOptions(){return this.node.type==='dualListbox';}
 get isChoiceGroup(){return ['radioGroup','checkboxGroup'].includes(this.node.type);}
 get choiceType(){return this.node.type==='radioGroup'?'radio':'checkbox';}
 get choiceName(){return this.node.id;}
 get renderedChildren(){return this.node.children;}
 get tabOptions(){const active=this.resolvedTab;return this.node.children.filter(n=>!this.preview||visible(n,this.state||{})).map(n=>({id:n.id,label:n.label,selected:n.id===active,disabled:this.preview&&!!n.props.disabled,tabIndex:n.id===active?'0':'-1',tabId:`${this.node.id}-tab-${n.id}`,panelId:`${this.node.id}-panel-${n.id}`}));}
 tabClick(event){event.stopPropagation();this.activateTab(event.currentTarget.dataset.id);}
 choiceChange(event){if(!this.preview)return;const value=this.choiceType==='radio'?event.target.value:[...this.template.querySelectorAll('input[data-choice]:checked')].map(i=>i.value).join(',');this.dispatchEvent(new CustomEvent('previewchange',{detail:{key:this.node.label,value},bubbles:true,composed:true}));}
 get multiple(){return ['checkboxGroup','dualListbox'].includes(this.node.type);}
 get options(){const selected=String(this.value??'').split(',').map(v=>v.trim());return String(this.node.props.options||'').split('\n').map(v=>v.trim()).filter(Boolean).map((value,index)=>({key:String(index),value,selected:selected.includes(value)}));}
 get isMenu(){return this.node.type==='buttonMenu';}
 get isIconButton(){return this.node.type==='buttonIcon';}
 get iconName(){return this.node.props.iconName||'utility:info';}
 get isIcon(){return this.node.type==='icon';}
 get isSelection(){return isSelectionType(this.node.type);}
 adapterEvent(event){const contract=componentDefinition(this.node.type)?.adapter;if(!contract?.eventsOut.includes(event.type))return;const payload=event.detail;this.dispatchEvent(new CustomEvent('adapterevent',{detail:{componentId:this.node.id,preview:this.preview,eventName:event.type,payload},bubbles:true,composed:true}));if(this.preview){const detail={key:this.node.label,value:payload[contract.previewValue],componentId:this.node.id};if(contract.previewRecords)detail.selectedRecords=payload[contract.previewRecords];else Object.assign(detail,payload);this.dispatchEvent(new CustomEvent('previewchange',{detail,bubbles:true,composed:true}));}}
 get isOutput(){return ['outputField','helptext','badge','pill','spinner','fileUpload'].includes(this.node.type);}
 get outputCaption(){return ({spinner:'Loading indicator',fileUpload:'Salesforce file upload · visual configuration',lookup:'Record search · visual configuration',outputField:this.value,helptext:this.value,pill:'Removable selection',badge:''})[this.node.type];}
 get buttonClass(){return this.node.props.variant==='brand'?'primary':'';}
 get hasPackBinding(){return !!this.node.data.packBinding?.packId;} get bindingError(){return this.node.data.boundError;} get hasBoundTable(){return this.isTable&&this.hasPackBinding&&!this.bindingError;} get boundJson(){return JSON.stringify(this.node.data.boundSample,null,2);}
 get boundColumns(){const rows=Array.isArray(this.node.data.boundSample)?this.node.data.boundSample:[];return [...new Set(rows.flatMap(r=>Object.keys(r||{})))].map(key=>({key,label:key}));}
 get noBoundRows(){return !this.boundRows.length;}
 get boundRows(){const rows=Array.isArray(this.node.data.boundSample)?this.node.data.boundSample:[];return rows.map((r,index)=>({key:String(index),cells:this.boundColumns.map(c=>({key:c.key,value:typeof r[c.key]==='object'?JSON.stringify(r[c.key]):String(r[c.key]??'')}))}));}
 get isSummary(){return this.node.type==='summaryTable';}get isTable(){return this.node.type==='table';} get isButton(){return this.node.type==='button';} get isSearch(){return false;}
 get isChild(){return this.node.type==='child';} get isCombo(){return this.node.type==='combobox';}
 get isInput(){return this.node.type==='inputField';} get label(){return this.node.label;}
 get value(){return this.node.props.value;} get readonly(){return this.node.props.mode==='read';}
 get tag(){return `${this.node.type} · ${this.node.id}`;}
 select(event){event.stopPropagation();if(!this.preview)this.dispatchEvent(new CustomEvent('nodeselect',{detail:this.node.id,bubbles:true,composed:true}));}
 drop(event){event.preventDefault();event.stopPropagation();if(!this.preview)this.dispatchEvent(new CustomEvent('nodedrop',{detail:{parentId:this.isTabs&&event.dataTransfer.getData('text/plain')!=='tab'?(this.resolvedTab||this.node.id):this.node.id,type:event.dataTransfer.getData('text/plain')},bubbles:true,composed:true}));}
 allow(event){if(!this.preview)event.preventDefault();}
 previewChange(event){if(this.preview)this.dispatchEvent(new CustomEvent('previewchange',{detail:{key:this.node.label,value:event.target.type==='checkbox'?event.target.checked:event.target.multiple?[...event.target.selectedOptions].map(o=>o.value).join(','):event.target.value},bubbles:true,composed:true}));}
 action(event){event.stopPropagation();this.dispatchEvent(new CustomEvent('demoaction',{detail:this.node.label,bubbles:true,composed:true}));}
}
