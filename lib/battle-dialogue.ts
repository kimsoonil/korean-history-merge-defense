import {ansiBossQuotes,type ChapterId} from './ansi.ts';
import {frontForStage} from './campaign.ts';
export type BossLine={title:string;speaker:string;text:string;defeated:boolean;extra?:{speaker:string;text:string}[]};
export const remnantName='우중문 & 우문술';
export const victoryMessage='살수대첩 대승리! 고구려가 수나라의 침략으로부터 동아시아의 평화를 지켜냈습니다!';
export const siegeName='수나라 공성대장';
export const umunsulName='우문술';
export const naehoaName='내호아';
export const ujungmunName='우중문';
export function bossLine(name:string,stage:number,defeated=false,chapter:ChapterId=1):BossLine|null{
 if(chapter===2){const quotes=ansiBossQuotes[name];return quotes?{title:defeated?name+' 격퇴':name+' 출현',speaker:name,text:quotes[defeated?1:0],defeated}:null;}
 const front=frontForStage(stage);
 const target=front.id==='emperor'?'고구려군의 최후 방어선':front.name;
 if(name==='수양제')return {title:defeated?'최종 클리어':'65라운드 · ★수 양제 (본대 최종 병기)★',speaker:'수 양제',defeated,text:defeated?'30만 대군을 보냈거늘... 겨우 2,700명만 살아 돌아왔다고?! 내 나라가, 내 위대한 수나라가 고작 고구려 따위에게 이렇게 무너진단 말이냐아악!':'감히 고구려 놈들이 내 위대한 수나라를 모욕하느냐! 천자의 분노를 보여주마, 모두 비켜라!'};
 if(name===remnantName)return defeated?{title:'우중문 & 우문술 처치',speaker:'수나라 병사',text:'강물이... 강물이 갑자기 밀려옵니다! 으악! 살려주십시오! 몸이 떠내려갑니다!',defeated:true,extra:[{speaker:'우문술',text:'30만 대군이... 고작 수천 명만 남고 수장되다니... 이럴 수가...'}]}:{title:'60라운드 · 우중문 & 우문술 (별동대 패잔병 연합)',speaker:remnantName,text:'살수만 건너면 살 수 있다! 고구려군을 막아서고 후방을 사수하라!',defeated:false};
 if(name===naehoaName)return {title:defeated?'내호아 처치':'40라운드 · 내호아 (수나라 수군 사령관)',speaker:defeated?'수나라 병사':naehoaName,defeated,text:defeated?'함정이다! 평양성 외곽에 숨어있던 고구려 복병들이 기습해 옵니다! 배들이 침몰하고 있습니다!':'육군 녀석들을 기다릴 것 없다! 우리 수군이 먼저 평양성을 함락시키겠다!'};
 if(name===ujungmunName)return {title:defeated?'우중문 처치':'50라운드 · 우중문 (별동대 총사령관)',speaker:ujungmunName,defeated,text:defeated?'윽... 식량은 없고 병사들은 굶주려 창을 쥘 힘도 없구나... 일단 철수한다!':'감히 나에게 신기한 책략 운운하며 조롱해?! 평양성을 잿더미로 만들어 주마!'};
 if(name===umunsulName)return {title:defeated?'우문술 처치':'30라운드 · 우문술 (별동대 우익위 대장군)',speaker:umunsulName,defeated,text:defeated?'고구려의 매복인가?! 제길, 행군 속도가 늦어지면 군량이 부족해진다... 서둘러라!':'요동성에 묶여 있을 시간이 없다. 짐을 버리고 속도를 높여라! 평양성으로 직공한다!'};
 if(name===siegeName)return {title:defeated?'수나라 공성대장 처치':'20라운드 · 수나라 공성대장 (충차/발석거 부대)',speaker:defeated?'수나라 병사':siegeName,defeated,text:defeated?'장군님! 고구려군이 던진 돌과 기름 때문에 공성 무기가 전부 불타고 있습니다! 더는 전진할 수 없습니다!':`공성 무기를 아끼지 마라! ${front.id==='emperor'?target:front.id==='salsu'?'살수의 방어선':`${target}의 성벽`}을 무너뜨려라!`};
 if(name===vanguardName)return {title:defeated?'수나라 선봉장 처치':'10라운드 · 중간 보스 출현',speaker:vanguardName,defeated,text:defeated?`큭... 고구려 놈들의 방어선이 왜 이렇게 단단한 거야? ${target}${front.id==='salsu'?'를':'을'} 넘기가 너무 힘들다!`:front.id==='emperor'?'고구려 놈들! 내가 최후의 방어선을 뚫고 수양제님의 승리를 쟁취하겠다!':`고구려 놈들! 내가 이 ${front.id==='salsu'?'방어선':'요새'}를 뚫고 수양제님께 ${target}${front.id==='salsu'?'를':'을'} 바치겠다!`};
 return null;
}
export function defeatedDialogueBoss(enemies:{id:number;name:string;boss:boolean;hp:number}[],hits:Map<number,number>){
 return enemies.find(e=>e.boss&&[vanguardName,siegeName,umunsulName,naehoaName,ujungmunName,remnantName,...Object.keys(ansiBossQuotes).filter(n=>n!=='당 태종')].includes(e.name)&&e.hp>0&&e.hp<=(hits.get(e.id)??0));
}
export const vanguardName='수나라 선봉장';
export const vanguardArrival='고구려 놈들! 내가 이 요새를 뚫고 수양제님께 요동성을 바치겠다!';
export const vanguardDefeat='큭... 고구려 놈들의 방어선이 왜 이렇게 단단한 거야? 요동성을 넘기가 너무 힘들다!';
export function defeatedVanguard(enemies:{id:number;name:string;boss:boolean;hp:number}[],hits:Map<number,number>){
 return enemies.find(e=>e.boss&&e.name===vanguardName&&e.hp>0&&e.hp<=(hits.get(e.id)??0));
}
