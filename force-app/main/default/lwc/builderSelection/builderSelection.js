import { LightningElement, api } from 'lwc';
import { selectedValues, selectionOptions, selectionError } from 'c/builderModel';
export default class BuilderSelection extends LightningElement {
 _node; signature=''; selected=[]; search=''; error=''; touched=false; opened=false;
 @api get node(){return this._node;} set node(value){this._node=value;const signature=JSON.stringify([value.id,value.type,{...value.props,value:value.data.valueBinding?.source==='state'?undefined:value.props.value},value.data.boundSample,value.data.boundError,value.data.valueBinding]);if(signature!==this.signature){this.signature=signature;this.search='';this.opened=false;this.touched=false;this.error='';try{this.selected=selectedValues(value.props.value,value.type!=='lookup');}catch(e){this.selected=[];this.error=e.message;}}else if(value.data.valueBinding?.source==='state'){try{this.selected=selectedValues(value.props.value,value.type!=='lookup');}catch(e){this.error=e.message;}}}
 get label(){return this.node.label;} get single(){return this.node.type==='lookup';} get picklist(){return this.node.type==='multiPicklist';}
 get disabled(){return !!this.node.props.disabled||this.node.props.mode==='read';} get required(){return !!this.node.props.required;}
 get placeholder(){return this.node.props.placeholder||'Search…';} get max(){return this.single?1:Number(this.node.props.maxSelections)||50;}
 get source(){try{return selectionOptions(this.node);}catch(e){return [];}}
 get sourceError(){try{selectionOptions(this.node);return this.node.data.boundError||'';}catch(e){return e.message;}}
 get message(){return this.sourceError||this.error||(this.touched?selectionError(this.node,this.selected):'');}
 get results(){const query=this.search.trim().toLowerCase();return this.source.filter(r=>(this.picklist||!this.selected.includes(r.value))&&(r.label+' '+r.detail).toLowerCase().includes(query)).map(r=>({...r,checked:this.selected.includes(r.value),disabled:this.disabled||(!this.selected.includes(r.value)&&this.selected.length>=this.max)}));}
 get empty(){return !this.results.length;} get selectedItems(){return this.selected.map(value=>({...this.source.find(r=>r.value===value)||{label:value,detail:'Saved selection',value},removeLabel:'Remove '+(this.source.find(r=>r.value===value)?.label||value)}));}
 get firstItems(){return this.selectedItems.slice(0,1);}
 get extraCount(){return Math.max(0,this.selected.length-1);}
 get hasExtra(){return this.extraCount>0;}
 get extraLabel(){return 'View all '+this.selected.length+' selected items';}
 get searchLabel(){return 'Search '+this.label;}
 get selectionClass(){return this.opened?'selection opened':'selection';}
 insideEvent=null;
 connectedCallback(){this.outsideClick=event=>{if(this.insideEvent!==event)this.opened=false;this.insideEvent=null;};document.addEventListener('pointerdown',this.outsideClick);}
 insidePointer(event){this.insideEvent=event;}
 disconnectedCallback(){document.removeEventListener('pointerdown',this.outsideClick);}
 open(){if(!this.disabled)this.opened=true;}
 toggle(){if(!this.disabled)this.opened=!this.opened;}
 showSelected(){if(!this.disabled){this.search='';this.opened=true;}}
 done(){this.opened=false;this.template.querySelector('.toggle')?.focus();}
 keydown(event){if(event.key==='Escape'){event.stopPropagation();this.done();}else if(event.key==='ArrowDown'&&!this.opened){event.preventDefault();this.open();}}
 get count(){return this.selected.length;} get icon(){return this.picklist?'utility:list':'standard:account';}
 get disableSelectAll(){return this.disabled||!!this.sourceError||!this.results.some(r=>!r.checked);} get disableClear(){return this.disabled||!this.selected.length;}
 searchChange(event){this.search=event.target.value;this.open();}
 pick(event){if(this.disabled||this.sourceError)return;const value=event.currentTarget.dataset.value;if(!this.source.some(r=>r.value===value))return;let next=this.single?[value]:this.selected.includes(value)?this.selected:[...this.selected,value];this.commit(next);this.search='';if(this.single)this.done();}
 check(event){const value=event.target.dataset.value;if(this.disabled||this.sourceError)return;this.commit(event.target.checked?[...new Set([...this.selected,value])]:this.selected.filter(v=>v!==value));}
 remove(event){if(!this.disabled)this.commit(this.selected.filter(v=>v!==event.currentTarget.dataset.value));}
 clear(){if(!this.disabled)this.commit([]);}
 selectAll(){if(this.disabled||this.sourceError)return;const next=[...new Set([...this.selected,...this.results.map(r=>r.value)])];this.commit(next);}
 commit(next){if(next.length>this.max){this.error=this.node.props.messageLimit||'Select no more than '+this.max+' item(s).';return;}this.selected=next;this.touched=true;this.error='';this.dispatchEvent(new CustomEvent('selectionchange',{detail:{value:this.single?next[0]||null:[...next],records:this.source.filter(r=>next.includes(r.value)),valid:!selectionError(this.node,next)}}));}
 @api reportValidity(){this.touched=true;return !this.message;}
}
