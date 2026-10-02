// Registry describes visual configuration. Salesforce execution is a separate adapter phase.
const text=(key,label,value='')=>({key,label,type:'text',default:value});
const number=(key,label,value,min=0,max=80)=>({key,label,type:'number',default:value,min,max});
const flag=(key,label=key[0].toUpperCase()+key.slice(1))=>({key,label,type:'checkbox',default:false});
const pick=(key,label,values,value=values[0])=>({key,label,type:'select',values,default:value});
const options={key:'options',label:'Options (one value per line)',type:'textarea',default:'Option A\nOption B'};
const inputProps=[text('value','Default value'),text('placeholder','Placeholder'),flag('required'),flag('disabled')];
const definitions=[
 ['section','Section','Layouts',[],true],['grid','Responsive Grid','Layouts',[number('columns','Columns',2,1,4),number('gap','Column gap px',12,0,48)],true],
 ['card','Card','Layouts',[],true],['tabs','Tabset','Layouts',[],true],['tab','Tab','Layouts',[],true],['accordion','Accordion','Layouts',[],true],['accordionSection','Accordion Section','Layouts',[],true],['modal','Modal','Layouts',[pick('size','Size',['small','medium','large'])],true],
 ['input','Input','Inputs',[pick('inputType','Input type',['text','number','date','datetime-local','email','tel','url','checkbox','search','password','time','toggle']),...inputProps]],
 ['textarea','Textarea','Inputs',[...inputProps,number('rows','Rows',3,1,15)]],['combobox','Combobox','Inputs',[...inputProps,options]],['lookup','Record Picker','Inputs',[...inputProps,text('objectApiName','Object API name','Account')]],
 ['dualListbox','Dual Listbox','Inputs',[options,text('value','Selected values (comma separated)'),flag('disabled')]],['radioGroup','Radio Group','Inputs',[...inputProps,options]],['checkboxGroup','Checkbox Group','Inputs',[options,text('value','Selected values (comma separated)'),flag('disabled')]],['richText','Rich Text Editor','Inputs',[text('value','Sample text'),flag('disabled')]],
 ['button','Button','Actions',[pick('variant','Variant',['neutral','brand','destructive','success']),flag('disabled')]],['buttonIcon','Icon Button','Actions',[text('iconName','Icon name','utility:edit'),flag('disabled')]],['buttonMenu','Button Menu','Actions',[options,flag('disabled')]],
 ['table','Datatable','Data',[]],['form','Record Form','Record Forms',[pick('mode','Form mode',['edit','create','read']),number('columns','Columns',2,1,4),text('objectApiName','Object API name','Contact')],true],
 ['recordEditForm','Record Edit Form','Record Forms',[text('objectApiName','Object API name','Contact'),number('columns','Columns',2,1,4)],true],['recordViewForm','Record View Form','Record Forms',[text('objectApiName','Object API name','Contact'),number('columns','Columns',2,1,4)],true],
 ['inputField','Input Field','Record Forms',[text('fieldApiName','Field API name','Name'),...inputProps]],['outputField','Output Field','Record Forms',[text('fieldApiName','Field API name','Name'),text('value','Sample value')]],
 ['spinner','Spinner','Feedback',[pick('size','Size',['small','medium','large'])]],['icon','Icon','Feedback',[text('iconName','Icon name','standard:account'),pick('size','Size',['small','medium','large'])]],['helptext','Helptext','Feedback',[text('value','Help text')]],['badge','Badge','Feedback',[]],['pill','Pill','Feedback',[]],
 ['fileUpload','File Upload','Files',[text('accept','Allowed file extensions','.pdf,.png,.jpg'),flag('multiple'),flag('disabled')]],
 ['search','Product Search','Custom',[...inputProps]],['price','Price Editor','Custom',[...inputProps]],['child','Child LWC','Custom',[text('componentName','Registered component name')]]
];
export const registry=definitions.map(([type,label,group,properties,container=false])=>({type,label,group,properties,container,events:['button','buttonIcon'].includes(type)?['click']:type==='table'?['rowselection','cellchange','save','rowaction']:['form','recordEditForm'].includes(type)?['submit','success','error']:type==='fileUpload'?['uploadfinished']:type==='child'?[]:container?[]:['change'],binding: type==='table'?'List':['form','recordEditForm','recordViewForm'].includes(type)?'Object':'Value'}));
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
export const clone = value => JSON.parse(JSON.stringify(value));
export const palette = registry;
export const containers = registry.filter(r=>r.container).map(r=>r.type);
export function makeNode(type,id){const item=palette.find(x=>x.type===type);if(!item)throw Error('Unsupported component');return {id,type,label:item.label,children:[],props:{variant:'neutral',width:'100%',padding:16,color:'#0176d3',value:'',mode:'edit',...defaultProperties(type)},data:{object:'Contact',fields:'Name, Email, Phone',relationship:'AccountId',filter:''},rules:[],connections:[],actions:[]};}
export function sample(){const root=makeNode('section','root');root.label='Order Workspace';const form=makeNode('form','details');form.label='Order Details';for(const [type,id,label,value] of [['lookup','customer','Customer','Acme Industries'],['combobox','warehouse','Warehouse','Pune Warehouse'],['input','date','Order Date','2026-10-01']]){const n=makeNode(type,id);n.label=label;n.props.value=value;form.children.push(n);}const table=makeNode('table','items');table.label='Order Items';table.data={object:'OrderItem',fields:'Product, Quantity, UnitPrice, Discount, Total',relationship:'OrderId',filter:''};table.actions=[{id:'a1',type:'Validate',name:'Validate items',error:'Show error'},{id:'a2',type:'Apex',name:'SaveOrder',error:'Stop'},{id:'a3',type:'Refresh',name:'OrderSummary',error:'Continue'}];table.rules=[{id:'r1',field:'Order Status',operator:'equals',value:'Draft',effect:'Visible',join:'AND'}];const search=makeNode('search','search');const delivery=makeNode('section','delivery');delivery.label='Delivery Details';const address=makeNode('input','address');address.label='Delivery Address';address.props.value='MIDC Industrial Area, Pune';delivery.children.push(address);root.children=[form,search,table,delivery];return {schemaVersion:1,name:'Order Workspace',target:'lightning__RecordPage',nodes:[root],versions:[]};}
export function flatten(nodes,depth=0){return nodes.flatMap(n=>[{...n,depth,indent:`padding-left:${depth*16+8}px`},...flatten(n.children,depth+1)]);}
export function find(nodes,id){for(const n of nodes){if(n.id===id)return n;const result=find(n.children,id);if(result)return result;}return null;}
export function parentOf(nodes,id,parent=null){for(const node of nodes){if(node.id===id)return parent;const result=parentOf(node.children,id,node);if(result)return result;}return null;}
export function remove(nodes,id){for(let i=0;i<nodes.length;i++){if(nodes[i].id===id)return nodes.splice(i,1)[0];const result=remove(nodes[i].children,id);if(result)return result;}return null;}
export function insert(nodes,node,parentId){if(!parentId){if(!canContain(null,node.type))throw Error('This component requires its matching parent container');nodes.push(node);return;}const parent=find(nodes,parentId);if(!parent||!containers.includes(parent.type))throw Error('Choose a container');if(!canContain(parent.type,node.type))throw Error('Component is not allowed in this container');parent.children.push(node);}
export function move(nodes,id,parentId){const node=find(nodes,id);if(!node)throw Error('Missing node');if(id===parentId||find(node.children,parentId))throw Error('Cannot move a component inside itself');const target=parentId?find(nodes,parentId):null;if(parentId&&(!target||!containers.includes(target.type)))throw Error('Choose a container');if(!canContain(target?.type,node.type))throw Error('Component is not allowed in this container');remove(nodes,id);insert(nodes,node,parentId);}
export function validateProject(p){if(!p||p.schemaVersion!==1||typeof p.name!=='string'||!Array.isArray(p.nodes))throw Error('Invalid project file');if(!['lightning__RecordPage','lightning__AppPage','lightning__HomePage','lightning__RecordAction'].includes(p.target))throw Error('Invalid target');const ids=new Set();let count=0;function visit(nodes,depth,parentType=null){if(depth>15)throw Error('Maximum nesting is 15');for(const n of nodes){if(++count>500)throw Error('Maximum 500 components');if(!n||typeof n.id!=='string'||ids.has(n.id)||!palette.some(x=>x.type===n.type)||typeof n.label!=='string'||!Array.isArray(n.children)||!n.props||!n.data||!Array.isArray(n.rules)||!Array.isArray(n.actions)||!Array.isArray(n.connections))throw Error('Invalid component definition');if(!parentType&&!canContain(null,n.type))throw Error('Component requires a matching parent');if(!containers.includes(n.type)&&n.children.length)throw Error('Leaf components cannot contain children');for(const child of n.children){if(!canContain(n.type,child.type)&&n.type!=='tabs')throw Error('Invalid component nesting');}ids.add(n.id);visit(n.children,depth+1,n.type);}}visit(p.nodes,0);return p;}
export function ruleMatches(rule,state){const a=state[rule.field],b=rule.value;switch(rule.operator){case 'equals':return String(a)===String(b);case 'not equals':return String(a)!==String(b);case 'contains':return String(a??'').includes(String(b));case 'blank':return a==null||a==='';case 'greater than':return Number(a)>Number(b);default:return false;}}
export function visible(node,state){const rules=node.rules.filter(r=>r.effect==='Visible');if(!rules.length)return true;return rules.reduce((result,r,i)=>i===0?ruleMatches(r,state):(r.join==='OR'?result||ruleMatches(r,state):result&&ruleMatches(r,state)),true);}
