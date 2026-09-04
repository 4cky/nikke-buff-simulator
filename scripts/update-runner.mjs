import {cp,mkdir,readdir,rm,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import {buildStatic} from './build.mjs';

const ROOT_FILES=['package.json','index.html','styles.css','app.js','view-model.js','catalog-model.js','comparison-qa.js','sources.js','formation.html','formation.css','formation.js','formation-model.js','review.html','review.css','review.js','review-model.js','review-audit-v4.2-residual.json'];
export async function materializeCandidateProject(stageRoot,output,canonicalDataDir='data'){
  const project=join(stageRoot,'project');
  await mkdir(project,{recursive:true});
  await mkdir(join(project,'work'),{recursive:true});
  for(const file of ROOT_FILES)await cp(file,join(project,file));
  await cp('scripts',join(project,'scripts'),{recursive:true});
  await cp('tests',join(project,'tests'),{recursive:true});
  try{await cp('.openai',join(project,'.openai'),{recursive:true});}catch(error){
    if(error.code!=='ENOENT')throw error;
  }
  await cp(canonicalDataDir,join(project,'data'),{recursive:true});
  for(const [name,value] of Object.entries(output)){
    if(!/^[a-z0-9-]+$/.test(name))throw Error(`Invalid candidate filename: ${name}`);
    await writeFile(join(project,'data',`${name}.json`),JSON.stringify(value,null,2)+'\n');
  }
  return project;
}
export function runNode(args,{cwd='.',label='node'}={}){
  return new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,args,{cwd,stdio:['ignore','pipe','pipe'],windowsHide:true});let stdout='',stderr='';
    child.stdout.on('data',d=>stdout+=d);child.stderr.on('data',d=>stderr+=d);
    child.on('error',reject);child.on('close',code=>resolve({label,code,stdout,stderr}));
  });
}
export async function testCandidate(project){
  const tests=(await readdir(join(project,'tests'))).filter(f=>f.endsWith('.test.mjs')).sort().map(f=>join('tests',f));
  return runNode(['--test',...tests],{cwd:project,label:'regression tests'});
}
export async function buildCandidate(stageRoot,project){
  const outDir=join(stageRoot,'dist');await buildStatic({root:project,dataDir:join(project,'data'),outDir});return {code:0,label:'production build',stdout:`Built ${outDir}\n`,stderr:'',outDir};
}
export async function cleanupStage(stageRoot){await rm(stageRoot,{recursive:true,force:true});}
