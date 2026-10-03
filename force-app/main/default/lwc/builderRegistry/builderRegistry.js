// Registry describes visual configuration. Salesforce execution is a separate adapter phase.
const text=(key,label,value='')=>({key,label,type:'text',default:value});
const number=(key,label,value,min=0,max=80)=>({key,label,type:'number',default:value,min,max});
const flag=(key,label=key[0].toUpperCase()+key.slice(1))=>({key,label,type:'checkbox',default:false});
const pick=(key,label,values,value=values[0])=>({key,label,type:'select',values,default:value});
const options={key:'options',label:'Options (one value per line)',type:'textarea',default:'Option A\nOption B'};
const inputProps=[text('value','Default value'),text('placeholder','Placeholder'),flag('required'),flag('disabled')];
const optionalNumber=(key,label)=>({...number(key,label,'',0,1000000),optional:true});
const validationProperties=[
 text('min','Minimum value'),text('max','Maximum value'),text('step','Step / decimal increment','1'),
 optionalNumber('minLength','Minimum characters'),optionalNumber('maxLength','Maximum characters'),
 pick('textFormat','Allowed text',['any','letters','alphanumeric','digits','custom']),text('pattern','Custom regex (without / delimiters)'),
 text('messageRequired','Required message'),text('messageType','Invalid type / format message'),text('messageMin','Below minimum message'),text('messageMax','Above maximum message'),text('messageStep','Invalid increment message'),text('messageShort','Too short message'),text('messageLong','Too long message'),text('messagePattern','Pattern mismatch message'),
 text('toggleActive','Toggle active label','Active'),text('toggleInactive','Toggle inactive label','Inactive')
];
const lookupProps=[text('value','Default record ID(s; JSON array for multiple)'),text('placeholder','Search placeholder','Search records…'),flag('required'),flag('disabled'),text('objectApiName','Object API name','Account'),text('valueField','Record ID field','Id'),text('labelField','Display field path','Name'),text('detailField','Secondary field path','Code'),{key:'sampleRecords',label:'Sample records (JSON array)',type:'textarea',default:'[{"Id":"r1","Name":"Shree Ganesh Traders","Code":"RTL-1001 · Pune"},{"Id":"r2","Name":"Sai Enterprises","Code":"RTL-1002 · Nashik"},{"Id":"r3","Name":"Akash Hardware","Code":"RTL-1003 · Mumbai"}]'},text('messageRequired','Required message'),text('messageLimit','Selection limit message')];
export const isSelectionType=type=>['lookup','multiLookup','multiPicklist'].includes(type);
const definitions=[
 ['section','Section','Layouts',[],true],['grid','Responsive Grid','Layouts',[number('columns','Columns',2,1,4),number('gap','Column gap px',12,0,48)],true],
 ['card','Card','Layouts',[],true],['tabs','Tabset','Layouts',[],true],['tab','Tab','Layouts',[],true],['accordion','Accordion','Layouts',[],true],['accordionSection','Accordion Section','Layouts',[],true],['modal','Modal','Layouts',[pick('size','Size',['small','medium','large'])],true],
 ['input','Input','Inputs',[pick('inputType','Input type',['text','number','date','datetime-local','email','phone','tel','url','checkbox','search','password','time','toggle']),...inputProps,...validationProperties]],
 ['textarea','Textarea','Inputs',[...inputProps,number('rows','Rows',3,1,15)]],['combobox','Combobox','Inputs',[...inputProps,options]],['lookup','Lookup','Inputs',[...lookupProps]],
 ['multiLookup','Multi-select Lookup','Inputs',[...lookupProps,number('minSelections','Minimum selections',0,0,1000),number('maxSelections','Maximum selections',50,1,1000)]],['multiPicklist','Multi-select Picklist','Inputs',[text('value','Default values (JSON array)','[]'),text('placeholder','Search placeholder','Search options…'),flag('required'),flag('disabled'),options,number('minSelections','Minimum selections',0,0,1000),number('maxSelections','Maximum selections',50,1,1000),text('messageRequired','Required message'),text('messageLimit','Selection limit message')]],
 ['dualListbox','Dual Listbox','Inputs',[options,text('value','Selected values (comma separated)'),flag('disabled')]],['radioGroup','Radio Group','Inputs',[...inputProps,options]],['checkboxGroup','Checkbox Group','Inputs',[options,text('value','Selected values (comma separated)'),flag('disabled')]],['richText','Rich Text Editor','Inputs',[text('value','Sample text'),flag('disabled')]],
 ['button','Button','Actions',[pick('variant','Variant',['neutral','brand','destructive','success']),flag('disabled')]],['buttonIcon','Icon Button','Actions',[text('iconName','Icon name','utility:edit'),flag('disabled')]],['buttonMenu','Button Menu','Actions',[options,flag('disabled')]],
 ['summaryTable','Summary Table','Data',[]],['table','Datatable','Data',[]],['form','Record Form','Record Forms',[pick('mode','Form mode',['edit','create','read']),number('columns','Columns',2,1,4),text('objectApiName','Object API name','Contact')],true],
 ['recordEditForm','Record Edit Form','Record Forms',[text('objectApiName','Object API name','Contact'),number('columns','Columns',2,1,4)],true],['recordViewForm','Record View Form','Record Forms',[text('objectApiName','Object API name','Contact'),number('columns','Columns',2,1,4)],true],
 ['inputField','Input Field','Record Forms',[text('fieldApiName','Field API name','Name'),...inputProps]],['outputField','Output Field','Record Forms',[text('fieldApiName','Field API name','Name'),text('value','Sample value')]],
 ['spinner','Spinner','Feedback',[pick('size','Size',['small','medium','large'])]],['icon','Icon','Feedback',[text('iconName','Icon name','standard:account'),pick('size','Size',['small','medium','large'])]],['helptext','Helptext','Feedback',[text('value','Help text')]],['badge','Badge','Feedback',[]],['pill','Pill','Feedback',[]],
 ['fileUpload','File Upload','Files',[text('accept','Allowed file extensions','.pdf,.png,.jpg'),flag('multiple'),flag('disabled')]],
 ['search','Product Search','Custom',[...inputProps,...validationProperties]],['price','Price Editor','Custom',[...inputProps,...validationProperties]],['child','Child LWC','Custom',[text('componentName','Registered component name')]]
];
const entries=definitions.map(([type,label,group,properties,container=false])=>({type,label,group,properties,container,events:['button','buttonIcon'].includes(type)?['click']:type==='table'?['rowselection','cellchange','save','rowaction']:['form','recordEditForm'].includes(type)?['submit','success','error']:type==='fileUpload'?['uploadfinished']:type==='child'?[]:container?[]:['change'],binding: ['table','summaryTable'].includes(type)||isSelectionType(type)?'List':['form','recordEditForm','recordViewForm'].includes(type)?'Object':'Value'}));
export const registry=entries.map(entry=>({...entry,adapter:{propsIn:['node','preview'],eventsOut:entry.type==='table'?['tablechange']:isSelectionType(entry.type)?['selectionchange']:entry.events,commands:[],runtimeOutput:entry.type==='table',runtimeConsumer:entry.type==='summaryTable'?'summary':null,previewValue:entry.type==='table'?'rows':'value',previewRecords:isSelectionType(entry.type)?'records':null}}));
export const componentDefinition=type=>registry.find(r=>r.type===type);
export const defaultProperties=type=>Object.fromEntries((componentDefinition(type)?.properties||[]).map(p=>[p.key,p.default]));
export function canContain(parentType,childType){
 if(!componentDefinition(childType))return false;
 if(childType==='tab')return parentType==='tabs';
 if(childType==='accordionSection')return parentType==='accordion';
 if(childType==='inputField')return parentType==='recordEditForm';
 if(childType==='outputField')return parentType==='recordViewForm';
 if(!parentType)return true;
 if(!componentDefinition(parentType)?.container)return false;
 if(parentType==='tabs')return childType==='tab';
 if(parentType==='accordion')return childType==='accordionSection';
 if(parentType==='recordEditForm')return childType==='inputField'||childType==='button';
 if(parentType==='recordViewForm')return childType==='outputField';
 return true;
}
export const palette = registry;
export const containers = registry.filter(r=>r.container).map(r=>r.type);
