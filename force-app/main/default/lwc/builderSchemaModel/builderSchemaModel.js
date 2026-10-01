export function selectedFields(data){return Array.isArray(data.selectedFields)?data.selectedFields:(data.fields||'').split(',').map(x=>x.trim()).filter(Boolean);}
export function toggleField(data,path,checked){const fields=selectedFields(data).filter(x=>x!==path);if(checked)fields.push(path);return {...data,selectedFields:fields,fields:fields.join(', ')};}
export function changeObject(data,object){return {...data,object,fields:'',selectedFields:[],relationship:'',relatedSource:null,filter:'',filters:[]};}
export function pathFor(steps,field){return [...steps.map(s=>s.relationshipName),field].join('.');}
export function relatedSource(parent,child){return {kind:'related',parentObject:parent,object:child.objectApiName,relationshipName:child.relationshipName,foreignKey:child.foreignKey,parentValue:'context.recordId'};}
