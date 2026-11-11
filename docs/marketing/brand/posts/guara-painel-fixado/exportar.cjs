const sharp = require('/Users/rodri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const base = __dirname;
const names = ['01-ESQUERDA-RESPONDE.png','02-CENTRO-AGENDA.png','03-DIREITA-LEMBRA.png'];
(async()=>{
 for(let i=0;i<names.length;i++){
  await sharp(path.join(base,'PREVIA-PAINEL-COMPLETO.png')).extract({left:i*1080,top:0,width:1080,height:1440}).png().toFile(path.join(base,names[i]));
  const m=await sharp(path.join(base,names[i])).metadata();
  if(m.width!==1080||m.height!==1440) throw Error('Dimensão incorreta');
  console.log(names[i],m.width,m.height);
 }
 const joined=await sharp({create:{width:3240,height:1440,channels:3,background:'#ffffff'}}).composite(names.map((n,i)=>({input:path.join(base,n),left:i*1080,top:0}))).removeAlpha().raw().toBuffer();
 const original=await sharp(path.join(base,'PREVIA-PAINEL-COMPLETO.png')).removeAlpha().raw().toBuffer();
 if(!joined.equals(original)) throw Error('Recortes não recompõem o original');
 console.log('Verificado: os 3 recortes recompõem pixel a pixel o painel.');
 const sourceFiles=fs.readdirSync(base).filter(f=>!f.startsWith('.')).sort();
 const manifest={created:'2026-10-16',format:'3:4',postDimensions:[1080,1440],orderLeftToRight:names,exactRecomposition:true,files:sourceFiles.map(f=>({name:f,bytes:fs.statSync(path.join(base,f)).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(base,f))).digest('hex')}))};
 console.log(JSON.stringify(manifest,null,2));
})().catch(e=>{console.error(e);process.exit(1)});

