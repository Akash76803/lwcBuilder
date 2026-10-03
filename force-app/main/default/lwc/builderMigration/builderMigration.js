export function migrate(project) {
 if(!project||![1,2].includes(project.schemaVersion))throw Error('Unsupported project schema version: '+project?.schemaVersion);
 const next=JSON.parse(JSON.stringify(project));
 if(next.schemaVersion===1){next.schemaVersion=2;if(!Object.prototype.hasOwnProperty.call(next,'state'))next.state={};if(!Object.prototype.hasOwnProperty.call(next,'events'))next.events=[];if(!Object.prototype.hasOwnProperty.call(next,'actions'))next.actions=[];}
 return next;
}
