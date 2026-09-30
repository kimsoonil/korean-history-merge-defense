export function isIosDevice(userAgent:string,platform:string,maxTouchPoints:number){
 if(/iPad|iPhone|iPod/i.test(userAgent))return true;
 return platform==='MacIntel'&&maxTouchPoints>1;
}
