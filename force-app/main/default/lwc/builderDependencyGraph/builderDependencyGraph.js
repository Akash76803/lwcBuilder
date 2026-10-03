// Dependency-first ordering shared by table formulas and computed state.
export function topologicalOrder(nodes, options = {}) {
 const byId=new Map();
 for(const node of nodes){if(!node || typeof node.id!=='string' || byId.has(node.id))throw Error('Dependency IDs must be unique');byId.set(node.id,node);}
 const complete=new Set(),active=new Set(),order=[];
 function visit(id){
  if(complete.has(id))return;
  if(active.has(id))throw Error(options.cycleMessage||'Dependency graph contains a circular reference');
  const node=byId.get(id);if(!node)throw Error(options.missingMessage||'Missing dependency: '+id);
  active.add(id);for(const dep of node.dependencies||[])visit(dep);active.delete(id);complete.add(id);order.push(id);
 }
 byId.forEach((_,id)=>visit(id));return order;
}
