'use client';
import {useSyncExternalStore,type ImgHTMLAttributes,type CSSProperties} from 'react';
import {createImageCache,type ImageStatus} from '@/lib/image-loading';

const loadOnce=(src:string)=>new Promise<void>((resolve,reject)=>{
 if(!src){reject(new Error('Image source is empty'));return;}
 const image=new Image();
 let settled=false;
 const finish=()=>{
  if(settled)return;settled=true;
  const decoded=typeof image.decode==='function'?image.decode():Promise.resolve();
  decoded.then(resolve,()=>image.naturalWidth>0?resolve():reject(new Error('Image decode failed')));
 };
 image.onload=finish;
 image.onerror=()=>{if(!settled){settled=true;reject(new Error('Image unavailable'));}};
 image.src=src;
 if(image.complete&&image.naturalWidth>0)finish();
});
const loadWithRetry=async(src:string)=>{
 let failure:unknown;
 for(let attempt=0;attempt<3;attempt++){
  try{await loadOnce(src);return;}catch(error){failure=error;if(attempt<2)await new Promise(resolve=>window.setTimeout(resolve,150*(attempt+1)));}
 }
 throw failure;
};
type SharedImageCache=ReturnType<typeof createImageCache>;
const shared=globalThis as typeof globalThis&{__koreanHistoryImageCache?:SharedImageCache};
// Keep decoded-image state across popup unmounts and Next.js Fast Refreshes.
const cache=shared.__koreanHistoryImageCache??(shared.__koreanHistoryImageCache=createImageCache(loadWithRetry));
export function useImageStatus(src:string){return useSyncExternalStore(notify=>cache.subscribe(src,notify),()=>cache.status(src),()=>'loading' as ImageStatus);}
export function preloadImages(sources:string[]){for(const src of new Set(sources))cache.preload(src);}
export function ImageLoadingIndicator({status}:{status:ImageStatus}){
 if(status==='ready')return null;
 return <svg className={`image-loading-indicator ${status}`} viewBox="0 0 24 24" role="img" aria-label={status==='error'?'이미지를 불러오지 못했습니다':'이미지 로딩 중'}><title>{status==='error'?'이미지를 불러오지 못했습니다':'이미지 로딩 중'}</title>{status==='loading'?<><circle className="loading-track" cx="12" cy="12" r="9"/><path className="loading-arc" d="M12 3a9 9 0 0 1 9 9"/></>:<><circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 3v1"/></>}</svg>;
}
export default function LoadingImage({src='',style,...props}:Omit<ImgHTMLAttributes<HTMLImageElement>,'src'>&{src?:string}){
 const status=useImageStatus(src);
 return <><img {...props} src={src} data-image-status={status} style={{...style,visibility:status==='ready'?style?.visibility:'hidden'}}/><ImageLoadingIndicator status={status}/></>;
}
export function LoadingBackground({src,className,style}:{src:string;className:string;style?:CSSProperties}){
 const status=useImageStatus(src);
 return <div className={className} aria-hidden="true" style={{...style,backgroundImage:status==='ready'?`url("${src}")`:'none'}}><ImageLoadingIndicator status={status}/></div>;
}
