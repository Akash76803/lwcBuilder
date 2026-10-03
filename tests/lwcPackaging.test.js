import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync,readFileSync,existsSync} from 'node:fs';
const root=new URL('../force-app/main/default/lwc/',import.meta.url);
const bundles=readdirSync(root,{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>d.name);
test('every LWC bundle has matching JavaScript and Salesforce metadata',()=>{
 for(const name of bundles){
  assert.ok(existsSync(new URL(`${name}/${name}.js`,root)),`${name}: missing JavaScript`);
  const meta=new URL(`${name}/${name}.js-meta.xml`,root);
  assert.ok(existsSync(meta),`${name}: missing Salesforce bundle metadata`);
  const xml=readFileSync(meta,'utf8');
  assert.match(xml,/<LightningComponentBundle\s+xmlns="http:\/\/soap.sforce.com\/2006\/04\/metadata">/);
  assert.match(xml,/<apiVersion>\d+\.\d+<\/apiVersion>/);
  assert.match(xml,/<isExposed>(true|false)<\/isExposed>/);
  assert.match(xml,/<\/LightningComponentBundle>/);
 }
});
test('local c imports and template components resolve to complete bundles',()=>{
 for(const name of bundles){for(const file of readdirSync(new URL(name+'/',root)).filter(f=>/\.(js|html)$/.test(f))){
  const text=readFileSync(new URL(`${name}/${file}`,root),'utf8');
  const refs=file.endsWith('.js')?[...text.matchAll(/from\s+['"]c\/([^'"]+)['"]/g)].map(m=>m[1]):[...text.matchAll(/<c-([a-z][a-z0-9-]*)\b/g)].map(m=>m[1].replace(/-([a-z])/g,(_,c)=>c.toUpperCase()));
  for(const ref of refs){assert.ok(bundles.includes(ref),`${name}: missing dependency ${ref}`);assert.ok(existsSync(new URL(`${ref}/${ref}.js-meta.xml`,root)),`${name}: dependency ${ref} has no metadata`);}
 }}
});
