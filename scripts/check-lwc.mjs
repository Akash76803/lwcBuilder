import {transformSync} from '@lwc/compiler';
import fs from 'node:fs';
const root='force-app/main/default/lwc';let count=0;
for(const name of fs.readdirSync(root)){for(const file of fs.readdirSync(`${root}/${name}`)){if(!/\.(js|html|css)$/.test(file))continue;const path=`${root}/${name}/${file}`;try{transformSync(fs.readFileSync(path,'utf8'),file,{name,namespace:'c',apiVersion:66});console.log(`PASS ${name}/${file}`);count++;}catch(error){console.error(`FAIL ${path}\n${error.message}`);process.exitCode=1;}}}
console.log(`${count} files compiled`);
