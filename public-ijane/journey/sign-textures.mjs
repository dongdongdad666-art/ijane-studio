import * as T from './vendor/three.module.js';
const textures=new Map();
export async function prepareSignTextures(){
 const response=await fetch(new URL('./lettering/manifest.json',import.meta.url));
 if(!response.ok)throw Error('Could not load street lettering');
 const records=await response.json(),loader=new T.TextureLoader();
 await Promise.all(records.map(async record=>{
  const texture=await loader.loadAsync(new URL('./lettering/'+record.file,import.meta.url).href);
  texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;textures.set(record.key,texture);
 }));
}
export function getSignTexture(text,w,h,color,bg){
 const texture=textures.get(JSON.stringify([text,w,h,color,bg]));
 if(!texture)throw Error('Missing street lettering: '+text);
 return texture;
}
