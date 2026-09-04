export const SOURCE_LABELS={nikke_gg:'NIKKE.GG',nikke_explorer:'Nikke Explorer',manual:'Manual',official:'Official'};
export function safeSourceUrl(type,value){
  try{
    const url=new URL(value);
    if(url.protocol!=='https:'||url.username||url.password)return null;
    if(type==='nikke_gg'&&url.hostname!=='nikke.gg')return null;
    if(type==='nikke_explorer'&&url.hostname!=='nikke.exynan.my.id')return null;
    if(!Object.hasOwn(SOURCE_LABELS,type))return null;
    return url.href;
  }catch{return null;}
}
