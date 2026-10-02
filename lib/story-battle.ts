import type {ChapterId} from './ansi.ts';
import {getStoryCampaign,getStoryStage} from './story-campaigns.ts';

export type StoryBattle={faction:string;enemyNames:readonly [string,string,string,string,string,string];naval?:boolean};

const battles:Record<ChapterId,StoryBattle>={
 1:{faction:'고구려군',enemyNames:['고구려 보병','고구려 창병','고구려 궁병','고구려 기병','고구려 성벽수비대','고구려 친위군']},
 2:{faction:'연합 적군',enemyNames:['백제 수비병','왜군 선봉','가야 철갑병','거란 기병','후연 정예병','동부여 친위군']},
 3:{faction:'수나라군',enemyNames:['수나라 보병','수나라 창병','수나라 궁병','수나라 기병','수나라 공성병','수나라 정예군']},
 4:{faction:'당나라군',enemyNames:['당나라 보병','당나라 창병','당나라 궁병','당나라 기병','당나라 공성병','당나라 정예군']},
 5:{faction:'백제군',enemyNames:['백제 보병','백제 창병','백제 궁병','백제 기병','백제 결사대','백제 친위군']},
 6:{faction:'당나라군',enemyNames:['당군 보병','당군 창병','당군 궁병','당군 기병','당군 수군','당군 정예군']},
 7:{faction:'주나라 추격군',enemyNames:['주나라 보병','주나라 창병','주나라 궁병','주나라 기병','주나라 추격대','주나라 정예군']},
 8:{faction:'거란군',enemyNames:['거란 보병','거란 창병','거란 궁병','거란 기병','거란 공성병','거란 정예군']},
 9:{faction:'몽골군',enemyNames:['몽골 보병','몽골 창병','몽골 궁병','몽골 기병','몽골 공성병','몽골 정예군']},
 10:{faction:'일본군',enemyNames:['일본 보병','일본 창병','일본 궁병','일본 기병','일본 조총병','일본 정예병'],naval:true},
};

const salsuBosses:Record<number,string>={10:'수나라 선봉장',20:'수나라 공성대장',30:'우문술',40:'내호아',50:'우중문',60:'우중문 & 우문술'};
// The nine stage bosses are fictionalized commanders, while each story's
// tenth-stage boss keeps the historical name from its campaign data.
const stageCommanders:Record<ChapterId,readonly string[]>={
 1:['고구려 변경 수비장','예성강 수문장','패하 선봉장','평양 외성장','남문 철갑장','평양 기병장','성벽 수비장','왕성 호위장','고국원왕 친위대장'],
 2:['관미성 수비장','백제 한성 호위장','왜군 선봉장','가야 철갑장','거란 추격장','후연 성문장','요동 돌격장','동부여 선봉장','북방 연합장'],
 3:['요동성 선봉장','요동성 공성장','수나라 우익장','수나라 수군장','별동대 총사령관','살수 패잔병장','수나라 친위장','살수 도하장','수양제 호위장'],
 4:['요동 정찰장','안시성 성문장','당군 성벽장','당군 공성장','야습 추격장','당군 포위장','토산 축조장','토산 돌격장','당군 총공세장'],
 5:['탄현 수비장','황산벌 선봉장','백제 기병장','백제 총공세장','화랑 저지장','계백 반격장','중앙 방패장','결사대 포위장','계백 친위장'],
 6:['웅진 주둔장','백제 고지 수비장','석문 선봉장','임진강 도하장','칠중성 공성장','매소성 선봉장','매소성 돌격장','기벌포 수군장','기벌포 선단장'],
 7:['영주 추격장','요수 도하장','동모산 정찰장','말갈 토벌장','주나라 선봉장','천문령 입구장','협곡 수색장','걸사비우 추격장','이해고 친위장'],
 8:['봉산 선봉장','안융진 돌격장','거란 외교 호위장','강동 추격장','흥화진 도하장','통주 기병장','개경 선봉장','반송 수색장','귀주 후위장'],
 9:['처인성 선봉장','남쪽 목책장','구릉 궁기병장','몽골 기병장','야습 지휘장','몽골 공성장','의병대 토벌장','살리타 친위장','승병 추격장'],
 10:['한산도 선봉 함장','견내량 추격장','학익진 돌파장','진주성 선봉장','진주성 공성장','김시민 추격장','행주산성 선봉장','행주산성 총공세장','권율 추격장'],
};
export const stageBossName=(chapter:ChapterId,stage:number)=>stage===10?getStoryCampaign(chapter).finalBoss:stageCommanders[chapter][stage-1];
export const legacyStageBossName=(chapter:ChapterId,stage:number)=>`${getStoryStage(chapter,stage).title} 지휘관`;
export const storyBattle=(chapter:ChapterId)=>battles[chapter];
export const storyEnemyNames=(chapter:ChapterId)=>battles[chapter].enemyNames;
export function storyBossName(chapter:ChapterId,stage:number,round:number){
 const finalRound=20+(stage-1)*5;
 if(round===finalRound)return stageBossName(chapter,stage);
 if(chapter===3&&salsuBosses[round])return salsuBosses[round];
 if(round===10||round>=20&&round%5===0)return `${battles[chapter].faction} 장군`;
 return null;
}
export const allStoryEnemyNames=[...Object.values(battles).flatMap(battle=>[...battle.enemyNames]),'일본 전선','일본 정예선'];
export const allStoryBossNames=[...Array.from({length:10},(_,chapterIndex)=>Array.from({length:10},(_,stageIndex)=>{
 const stage=stageIndex+1,total=20+stageIndex*5;
 return Array.from({length:total},(_,roundIndex)=>storyBossName((chapterIndex+1) as ChapterId,stage,roundIndex+1)).filter((name):name is string=>!!name);
}).flat()).flat(),...Array.from({length:10},(_,chapterIndex)=>Array.from({length:9},(_,stageIndex)=>legacyStageBossName((chapterIndex+1) as ChapterId,stageIndex+1))).flat()];

export function storyBossDialogue(chapter:ChapterId,stage:number,name:string,defeated:boolean){
 const story=getStoryCampaign(chapter),stageData=getStoryStage(chapter,stage);
 if(name===story.finalBoss)return defeated?story.epilogue.pages('플레이어')[1].text:`${stageData.title}의 운명은 이 전투에서 결정된다. 전군, 마지막 공세를 시작하라!`;
 return defeated?`${stageData.title}의 방어를 뚫지 못했다. 남은 병력을 수습해 물러난다.`:`${stageData.title}을 돌파하라! ${battles[chapter].faction}의 진격을 멈추지 마라!`;
}
