import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {withDataLock,prepareCollection,writeCollection} from './collect-data.mjs';
import {createDecision,emptyReviewStore} from './review-pipeline.mjs';
import {validateDataset} from './validate-data.mjs';
const read=async name=>JSON.parse(await readFile(`data/${name}.json`,'utf8'));
const store=async()=>{try{return await read('review-decisions');}catch(e){if(e.code==='ENOENT')return emptyReviewStore();throw e;}};
export function makeReviewServer({port=4174,previewPort=4173}={}){
  const token=randomBytes(32).toString('hex');
  const origins=new Set([`http://127.0.0.1:${port}`,`http://localhost:${port}`,`http://127.0.0.1:${previewPort}`,`http://localhost:${previewPort}`]);
  const hosts=new Set([`127.0.0.1:${port}`,`localhost:${port}`]);
  const send=(response,status,value)=>{response.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});response.end(JSON.stringify(value));};
  const server=createServer(async(request,response)=>{
    try{
      if(!hosts.has(request.headers.host))return send(response,403,{error:'Invalid local host'});
      const origin=request.headers.origin;
      if(origin&&!origins.has(origin))return send(response,403,{error:'Invalid origin'});
      if(origin){response.setHeader('access-control-allow-origin',origin);response.setHeader('vary','Origin');}
      const path=new URL(request.url,`http://127.0.0.1:${port}`).pathname;
      if(request.method==='OPTIONS'){
        if(!origin)return send(response,403,{error:'Origin required'});
        response.setHeader('access-control-allow-methods','GET, POST, OPTIONS');response.setHeader('access-control-allow-headers','Content-Type, X-Review-Token');return send(response,204,null);
      }
      if(path==='/api/reviews'&&request.method==='GET'){
        const result=await withDataLock(async()=>({store:await store(),items:await read('review-items'),report:await read('review-report')}));
        return send(response,200,{revision:result.store.revision,items:result.items,report:result.report,token});
      }
      if(path==='/api/reviews'&&request.method==='POST'){
        if(!origin||request.headers['x-review-token']!==token||!/^application\/json\b/.test(request.headers['content-type']||''))return send(response,403,{error:'保存リクエストを検証できません。画面を再読み込みしてください。'});
        let body='';for await(const chunk of request){body+=chunk;if(Buffer.byteLength(body)>1000000)throw Object.assign(Error('Request too large'),{status:413});}
        const payload=JSON.parse(body);
        const result=await withDataLock(async()=>{
          const [current,items,chars,cs,es]=await Promise.all([store(),read('review-items'),read('characters'),read('character-schema'),read('effect-schema')]);
          const next=createDecision(current,items,payload,effects=>{
            const errors=validateDataset(chars,effects,cs,es);
            for(const e of effects){
              const signedFixedReload=e.buff_type==='reload_speed'&&e.modifier_type==='set_modifier';
              if(e.value_unit==='boolean'?typeof e.value!=='boolean':typeof e.value!=='number'||!Number.isFinite(e.value)||e.value<0&&!signedFixedReload)errors.push('比較可能なRaw Valueを入力してください（固定リロード速度の減少値を除き数値は0以上、booleanはtrue/false）。');
              if(typeof e.value==='number'&&!e.stack_count&&e.max_raw_value!==null&&e.max_raw_value!==e.value)errors.push('スタックなしの最大Rawは元の値と同じにしてください。');
              for(const key of ['target','duration','trigger'])if(!e[key]?.trim())errors.push(`${key}を入力してください（不明のままでは承認できません）。`);
            }
            return errors;
          });
          const output=await prepareCollection({offline:true,decisionStore:next});
          await writeCollection(output,{'review-decisions':next});
          return {revision:next.revision,report:output['review-report'],items:output['review-items']};
        });
        return send(response,200,{...result,token});
      }
      if(path.startsWith('/api/'))return send(response,404,{error:'Not found'});
      if(!['GET','HEAD'].includes(request.method))return send(response,405,{error:'Method not allowed'});
      const name=path==='/'?'index.html':path.slice(1);
      const assets=new Set(['index.html','app.js','styles.css','view-model.js','catalog-model.js','comparison-qa.js','sources.js','review.html','review.js','review.css','review-model.js']);
      const dataAllowed=/^data\/(?:characters|effects|review-items|review-queue|review-report|collection-report|dataset-manifest|unknown-buff-candidates|unknown-reclassification-report|unrecognized-positive-effect-candidates|non-buff-effects|skill-hierarchies)\.json$/.test(name);
      if(!assets.has(name)&&!dataAllowed)return send(response,404,{error:'Not found'});
      const content=await readFile(name),ext=name.split('.').at(-1);
      response.writeHead(200,{'content-type':{html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8',json:'application/json; charset=utf-8'}[ext],
        'cache-control':'no-store','x-content-type-options':'nosniff','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self' http://127.0.0.1:4174 http://localhost:4174; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"});
      response.end(request.method==='HEAD'?undefined:content);
    }catch(e){send(response,e.status||400,{error:e.code==='ENOENT'?'データが未生成です。先に収集処理を実行してください。':e.message});}
  });
  server.on('listening',()=>{const actual=server.address().port;for(const hostname of ['127.0.0.1','localhost']){hosts.add(`${hostname}:${actual}`);origins.add(`http://${hostname}:${actual}`);}});
  return server;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const port=Number(process.env.NIKKE_REVIEW_PORT||4174);
  const server=makeReviewServer({port});server.listen(port,'127.0.0.1',()=>console.log(`Review ready: http://127.0.0.1:${server.address().port}/review.html`));
}
