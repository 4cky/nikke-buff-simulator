import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {extname,resolve,sep} from 'node:path';

const root=resolve('dist'),port=Number(process.env.PORT||process.argv[2]||4175);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};
const server=createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1');
    let name=decodeURIComponent(url.pathname).replace(/^\/+/, '');
    if(!name)name='index.html';if(name==='review'||name==='review/')name='review.html';
    const path=resolve(root,name),base=root+sep;
    if(path!==root&&!path.startsWith(base))throw Object.assign(Error('Forbidden'),{status:403});
    const info=await stat(path);if(!info.isFile())throw Object.assign(Error('Not found'),{status:404});
    const body=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Cache-Control':'no-cache, must-revalidate','X-Content-Type-Options':'nosniff'});res.end(body);
  }catch(error){res.writeHead(error.status||404,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});res.end(error.status===403?'Forbidden':'Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Dist preview ready: http://127.0.0.1:${port}/`));
