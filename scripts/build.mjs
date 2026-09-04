import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {relative,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const WORKER=`const CACHE_CONTROL='no-cache, must-revalidate';
export default {
  async fetch(request,env){
    if(!env?.ASSETS?.fetch)return new Response('Static asset binding is unavailable',{status:500});
    const url=new URL(request.url);
    if(url.pathname==='/')url.pathname='/index.html';
    if(url.pathname==='/review'||url.pathname==='/review/')url.pathname='/review.html';
    const response=await env.ASSETS.fetch(new Request(url,request));
    const headers=new Headers(response.headers);
    headers.set('Cache-Control',CACHE_CONTROL);
    headers.set('CDN-Cache-Control',CACHE_CONTROL);
    headers.set('X-Content-Type-Options','nosniff');
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  }
};
`;

async function filesUnder(root,dir=root){
  const rows=[];
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const path=resolve(dir,entry.name);
    if(entry.isDirectory())rows.push(...await filesUnder(root,path));
    else rows.push({path,name:relative(root,path).replaceAll('\\','/')});
  }
  return rows;
}

export async function artifactHash(outDir){
  const hash=createHash('sha256');
  for(const file of (await filesUnder(resolve(outDir))).filter(f=>f.name!=='deployment-manifest.json').sort((a,b)=>a.name.localeCompare(b.name))){
    hash.update(file.name);hash.update('\0');hash.update(await readFile(file.path));hash.update('\0');
  }
  return hash.digest('hex');
}

export async function buildStatic({root='.',dataDir='data',outDir='dist'}={}){
  await rm(outDir,{recursive:true,force:true});
  await mkdir(outDir,{recursive:true});
  for(const file of ['index.html','styles.css','app.js','view-model.js','catalog-model.js','comparison-qa.js','sources.js','formation.html','formation.css','formation.js','formation-model.js','review.html','review.css','review.js','review-model.js'])await cp(`${root}/${file}`,`${outDir}/${file}`);
  await cp(dataDir,`${outDir}/data`,{recursive:true});
  try{await cp(`${root}/.openai`,`${outDir}/.openai`,{recursive:true});}catch(error){
    if(error.code!=='ENOENT')throw error;
  }
  await mkdir(`${outDir}/server`,{recursive:true});
  await writeFile(`${outDir}/server/index.js`,WORKER);
  const dataset=JSON.parse(await readFile(`${dataDir}/dataset-manifest.json`,'utf8'));
  const deploymentManifest={
    deployment_id:null,
    deployed_at:null,
    parser_version:dataset.parser_version,
    character_count:dataset.character_count,
    comparison_effect_count:dataset.comparison_count,
    excluded_count:dataset.excluded_count,
    review_count:dataset.review_count,
    dataset_generated_at:dataset.generated_at,
    git_commit_hash:process.env.GIT_COMMIT_SHA||null,
    artifact_hash:await artifactHash(outDir),
    artifact_hash_algorithm:'sha256-tree-v1 (deployment-manifest.json excluded)'
  };
  await writeFile(`${outDir}/deployment-manifest.json`,JSON.stringify(deploymentManifest,null,2)+'\n');
  return outDir;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  await buildStatic();console.log('Static production bundle written to dist/.');
}
