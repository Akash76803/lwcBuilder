export function resolve(specifier,context,nextResolve){
 if(/^c\/builder[A-Za-z]+$/.test(specifier)){const name=specifier.slice(2);return {url:new URL('../force-app/main/default/lwc/'+name+'/'+name+'.js',import.meta.url).href,shortCircuit:true};}
 return nextResolve(specifier,context);
}
