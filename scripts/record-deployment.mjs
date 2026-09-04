import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const value=name=>{const prefix=`--${name}=`;return process.argv.find(arg=>arg.startsWith(prefix))?.slice(prefix.length)||null;};
export async function recordDeployment({deploymentId,versionId,url,kind='preview',deployedAt=new Date().toISOString()}={}){
  if(!deploymentId||!versionId||!url)throw Error('deployment-id, version-id, and url are required');
  const artifact=JSON.parse(await readFile('dist/deployment-manifest.json','utf8'));
  const receipt={...artifact,deployment_id:deploymentId,version_id:versionId,deployed_at:deployedAt,url,kind};
  await mkdir('outputs/deployments',{recursive:true});
  const safe=deploymentId.replace(/[^A-Za-z0-9_.-]/g,'_');
  await writeFile(`outputs/deployments/deployment-${safe}.json`,JSON.stringify(receipt,null,2)+'\n');
  await writeFile('outputs/deployments/latest.json',JSON.stringify(receipt,null,2)+'\n');
  return receipt;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const receipt=await recordDeployment({deploymentId:value('deployment-id'),versionId:value('version-id'),url:value('url'),kind:value('kind')||'preview'});console.log(JSON.stringify(receipt,null,2));
}
