const sharp=require('/Users/rodri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const names=['01-ESQUERDA-ESPECIALISTAS.png','02-CENTRO-FUNCOES.png','03-DIREITA-MANAUS.png'];
(async()=>{
const src=process.argv[2];if(!src)throw Error('Informe a imagem mestre');
await sharp(src).resize(3240,1440,{fit:'fill'}).png().toFile(path.join(__dirname,'PREVIA-PAINEL-COMPLETO.png'));
for(let i=0;i<3;i++){
await sharp(path.join(__dirname,'PREVIA-PAINEL-COMPLETO.png')).extract({left:1080*i,top:0,width:1080,height:1440}).png().toFile(path.join(__dirname,names[i]));
const m=await sharp(path.join(__dirname,names[i])).metadata();if(m.width!==1080||m.height!==1440)throw Error('Dimensões incorretas');
}
const whole=await sharp(path.join(__dirname,'PREVIA-PAINEL-COMPLETO.png')).removeAlpha().raw().toBuffer();
const joined=await sharp({create:{width:3240,height:1440,channels:3,background:'#ffffff'}}).composite(names.map((n,i)=>({input:path.join(__dirname,n),left:i*1080,top:0}))).removeAlpha().raw().toBuffer();
if(!whole.equals(joined))throw Error('Falha de recomposição');
const files=fs.readdirSync(__dirname).filter(f=>!f.startsWith('.')&&f!=='MANIFESTO.json').sort();
console.log(JSON.stringify({version:2,date:'2026-10-16',size:[1080,1440],exactRecomposition:true,order:names,files:files.map(name=>({name,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,name))).digest('hex')}))},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
