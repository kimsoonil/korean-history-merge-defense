import type {ChapterId} from './ansi.ts';
import {allStoryBossNames,storyBossDialogue} from './story-battle.ts';
import {getStoryCampaign,getStoryStage,storyCampaigns} from './story-campaigns.ts';

export type BossLine={title:string;speaker:string;text:string;defeated:boolean;extra?:{speaker:string;text:string}[]};
export const remnantName='우중문 & 우문술';
export const victoryMessage='살수대첩 대승리! 고구려가 수나라의 침략으로부터 동아시아의 평화를 지켜냈습니다!';
export const siegeName='수나라 공성대장';
export const umunsulName='우문술';
export const naehoaName='내호아';
export const ujungmunName='우중문';
export const vanguardName='수나라 선봉장';
export const vanguardArrival='고구려 놈들! 내가 이 요새를 뚫고 수양제님께 요동성을 바치겠다!';
export const vanguardDefeat='큭... 고구려 놈들의 방어선이 왜 이렇게 단단한 거야? 요동성을 넘기가 너무 힘들다!';

const finalBosses=new Set(storyCampaigns.map(story=>story.finalBoss));
const salsuLine=(name:string,defeated:boolean):BossLine|null=>{
 if(name===remnantName)return {title:defeated?'60라운드 · 별동대 패잔병 연합 격퇴':'60라운드 · 별동대 패잔병 연합',speaker:defeated?'수나라 병사':remnantName,defeated,text:defeated?'강물이 갑자기 밀려옵니다! 몸이 떠내려갑니다!':'살수만 건너면 살 수 있다! 후방을 사수하라!',extra:defeated?[{speaker:'우문술',text:'30만 대군이 고작 수천 명만 남다니… 이럴 수가…'}]:undefined};
 if(name===naehoaName)return {title:defeated?'내호아 처치':'내호아 출현',speaker:defeated?'수나라 병사':name,defeated,text:defeated?'평양성 외곽의 복병이다! 배들이 침몰하고 있습니다!':'우리 수군이 먼저 평양성을 함락시키겠다!'};
 if(name===ujungmunName)return {title:defeated?'우중문 처치':'우중문 출현',speaker:name,defeated,text:defeated?'식량은 없고 병사들은 굶주렸다. 일단 철수한다!':'평양성을 잿더미로 만들어 주마!'};
 if(name===umunsulName)return {title:defeated?'우문술 처치':'우문술 출현',speaker:name,defeated,text:defeated?'고구려의 매복인가?! 서둘러라!':'평양성으로 직공한다!'};
 if(name===siegeName)return {title:defeated?'수나라 공성대장 처치':'수나라 공성대장 출현',speaker:defeated?'수나라 병사':name,defeated,text:defeated?'공성 무기가 모두 불타고 있습니다!':'공성 무기를 아끼지 마라! 성벽을 무너뜨려라!'};
 if(name===vanguardName)return {title:defeated?'수나라 선봉장 처치':'수나라 선봉장 출현',speaker:name,defeated,text:defeated?vanguardDefeat:vanguardArrival};
 return null;
};

export function bossLine(name:string,stage:number,defeated:boolean,chapter:ChapterId=3):BossLine|null{
 if(chapter===3){const special=salsuLine(name,defeated);if(special)return special;}
 if(!allStoryBossNames.includes(name)&&name!==getStoryCampaign(chapter).finalBoss)return null;
 const stageData=getStoryStage(chapter,stage);
 return {title:defeated?`${name} 격퇴`:`${stageData.title} · ${name} 출현`,speaker:name,defeated,text:storyBossDialogue(chapter,stage,name,defeated)};
}
export function defeatedDialogueBoss(enemies:{id:number;name:string;boss:boolean;hp:number;chapter?:ChapterId}[],hits:Map<number,number>){
 return enemies.find(enemy=>enemy.boss&&!finalBosses.has(enemy.name)&&enemy.hp>0&&enemy.hp<=(hits.get(enemy.id)??0));
}
export function defeatedVanguard(enemies:{id:number;name:string;boss:boolean;hp:number}[],hits:Map<number,number>){
 return enemies.find(enemy=>enemy.boss&&enemy.name===vanguardName&&enemy.hp>0&&enemy.hp<=(hits.get(enemy.id)??0));
}
