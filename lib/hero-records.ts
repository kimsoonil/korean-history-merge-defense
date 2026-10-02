import {units} from './game.ts';

export const MAX_RECORD_STARS=7;
export type HeroRecord={stars:number;shards:number};
export type HeroRecords=Record<string,HeroRecord>;
export const shardsForNextStar=(stars:number)=>Math.max(1,stars+1);
export const heroRecordAttackPercent=(records:HeroRecords|undefined,name:string)=>Math.min(MAX_RECORD_STARS,records?.[name]?.stars??0)*.5;

export function normalizeHeroRecords(raw:unknown):HeroRecords{
 const source=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Record<string,unknown>:{};
 const result:HeroRecords={};
 for(const unit of units){
  if(unit.name==='시민')continue;
  const value=source[unit.name];
  if(!value||typeof value!=='object'||Array.isArray(value))continue;
  const record=value as Partial<HeroRecord>;
  if(!Number.isSafeInteger(record.stars)||!Number.isSafeInteger(record.shards))continue;
  const stars=Math.max(0,Math.min(MAX_RECORD_STARS,record.stars!));
  result[unit.name]={stars,shards:stars===MAX_RECORD_STARS?0:Math.max(0,Math.min(shardsForNextStar(stars)-1,record.shards!))};
 }
 return result;
}

export function drawHeroRecord(records:HeroRecords,availableNames:string[],random=Math.random){
 const available=units.filter(unit=>unit.name!=='시민'&&availableNames.includes(unit.name));
 if(!available.length)return null;
 const eligible=available.filter(unit=>(records[unit.name]?.stars??0)<MAX_RECORD_STARS);
 if(!eligible.length)return {records,unit:null,starGained:false,allMaxed:true};
 const unit=eligible[Math.min(eligible.length-1,Math.floor(Math.max(0,Math.min(.999999999,random()))*eligible.length))];
 const previous=records[unit.name]??{stars:0,shards:0};
 const shards=previous.shards+1,starGained=shards>=shardsForNextStar(previous.stars);
 const next={stars:Math.min(MAX_RECORD_STARS,previous.stars+(starGained?1:0)),shards:starGained?0:shards};
 return {records:{...records,[unit.name]:next},unit,starGained,allMaxed:false};
}
