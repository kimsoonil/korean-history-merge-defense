import {nadangYear,nadangGuide} from './nadang.ts';
import type {ChapterId} from './ansi.ts';
import {frontForStage} from './campaign.ts';
export function frontIntro(stage:number,chapter:ChapterId=1){
 const front=frontForStage(stage,chapter);
 if(chapter===4)return {title:nadangYear(stage)+' · '+front.name,lines:[front.intro],speaker:nadangGuide(stage),text:front.dialogue};
 if(chapter===3)return {title:'660년 · '+front.name,lines:[front.intro],speaker:'김유신',text:front.dialogue};
 if(chapter===2)return {title:'645년 · '+front.name,lines:[front.intro],speaker:'안시성주',text:front.dialogue};
 if(front.id==='yodong')return {title:'612년 요동성.',lines:['수나라 군사다! 막아라!'],speaker:'을지문덕',text:'성문을 굳게 걸어 잠그고, 적들이 단 한 걸음도 요동 땅을 밟지 못하게 하라!'};
 if(front.id==='pyongyang')return {title:'612년 평양성.',lines:['수나라 30만 별동대,','평양성 근접! 청야 작전을 개시하라!'],speaker:'을지문덕',text:'적들의 식량이 바닥나고 있다. 성문을 닫고 지칠 때까지 굳게 버텨라!'};
 if(front.id==='salsu')return {title:'612년 살수 청천강',lines:['적들이 살수를 건너 도망친다! 둑을 무너뜨리고 추격하라!'],speaker:'을지문덕',text:'하늘이 주신 기회다! 살수를 적들의 무덤으로 만들어라! 전 군, 돌격!'};
 return null;
}
