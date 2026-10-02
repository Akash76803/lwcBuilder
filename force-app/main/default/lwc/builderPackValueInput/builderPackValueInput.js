import { LightningElement, api } from 'lwc';
import { displayValue } from 'c/builderDataPackModel';
export default class BuilderPackValueInput extends LightningElement {
 @api type='Text'; @api value; @api label='Value';
 get text(){return displayValue(this.value);}get isBoolean(){return this.type==='Boolean';}get isJson(){return ['Object','List'].includes(this.type);}
 get inputType(){return {Number:'number',Decimal:'number',Date:'date',Email:'email',Phone:'tel',URL:'url'}[this.type]||'text';}
 get hint(){return {DateTime:'ISO date/time with timezone, e.g. 2026-10-02T10:00:00+05:30',RecordId:'15 or 18 character Salesforce record ID',Object:'JSON object, e.g. {"id":"a1"}',List:'JSON array, e.g. ["a1", "a2"]',Phone:'Text format; country codes and leading zeroes are preserved',Decimal:'Numeric value; decimal precision is JavaScript Number precision'}[this.type]||'';}
 get options(){return [{value:'',label:'Not set'},{value:'true',label:'True'},{value:'false',label:'False'}].map(o=>({...o,selected:o.value===this.text}));}
 change(event){this.dispatchEvent(new CustomEvent('valuechange',{detail:{value:event.target.value}}));}
}
