import {noryangEnemyNames,noryangBossNames} from './noryang.ts';
import {myeongnyangEnemyNames,myeongnyangBossNames} from './myeongnyang.ts';
import {haengjuEnemyNames,haengjuBossNames} from './haengju.ts';
import {hansandoEnemyNames,hansandoBossNames} from './hansando.ts';
import {cheoinEnemyNames,cheoinBossNames} from './cheoin.ts';
import {gwijuEnemyNames,gwijuBossNames} from './gwiju.ts';
import {nadangEnemyNames,nadangBossNames} from './nadang.ts';
import {hwangsanEnemyNames,hwangsanBossNames} from './hwangsan.ts';
import {ansiEnemyNames,ansiBossNames,type ChapterId} from './ansi.ts';
import {chapterOneBattles,FINAL_WAVE,waveCombatLevel} from './campaign.ts';
import {globalRound,roundBossName,stageRoundCount} from './rounds.ts';
import {roadPosition} from './battlefield.ts';
import {enemyStats,type Difficulty} from './enemy-stats.ts';
import {type UnitTier} from './unit-tiers.ts';
import {allStoryBossNames,allStoryEnemyNames,storyEnemyNames} from './story-battle.ts';
export type UnitDef = { name:string; tier:UnitTier; icon:string; role:string; skill:string; damage:number; range:number; rate:number; color:string; recipe?:string[]; portrait?:string; atlas?:{src:string;col:number;row:number} };
const portraitSlugs:Record<string,string>={창병:'spearman',활병:'archer',수병:'sailor',포수:'gunner',의병:'militia',기병:'cavalry',유생:'scholar',시민:'citizen'};
const heroSheets=[
 ['서희','온달','최무선','신숭겸','곽재우','김시민','허준','황희'],
 ['선덕여왕','문무왕','최영','정몽주','정약용','사명대사','윤관','태종 이방원'],
 ['연개소문','김춘추','대조영','왕건','강감찬','권율','계백','장보고'],
 ['이순신','세종대왕','광개토대왕','을지문덕','김유신','이성계','척준경','정조']
];
const heroAtlas=Object.fromEntries(heroSheets.flatMap((names,tier)=>names.map((name,index)=>[name,{src:`/portraits/tier-${tier+2}-atlas.png`,col:index%4,row:Math.floor(index/4)}]))) as Record<string,{src:string;col:number;row:number;standalone?:boolean}>;
// New hero art is stored as individual transparent PNGs. Heroes that already had atlas
// artwork keep using their original cell even when they move to a new progression tier.
const heroPortraits:Record<string,string>={
 근구수:'/portraits/tier-4/geungusu.png',견훤:'/portraits/tier-4/gyeon-hwon.png',정도전:'/portraits/tier-4/jeong-dojeon.png',최치원:'/portraits/tier-4/choe-chiwon.png',
 주몽:'/portraits/tier-5/jumong.png',박혁거세:'/portraits/tier-5/park-hyeokgeose.png',김수로왕:'/portraits/tier-5/kim-suro.png',온조왕:'/portraits/tier-5/onjo.png',진흥왕:'/portraits/tier-5/jinheung.png',궁예:'/portraits/tier-5/gungye.png',장수왕:'/portraits/tier-5/jangsu.png',성왕:'/portraits/tier-5/seong.png',문무왕:'/portraits/tier-5/munmu.png',
 김윤후:'/portraits/tier-6/kim-yunhu.png',근초고왕:'/portraits/tier-7/geunchogo.png',양만춘:'/portraits/tier-7/yang-manchun.png',
};
const make=(name:string,tier:UnitTier,icon:string,role:string,skill:string,damage:number,range:number,rate:number,color:string,recipe?:string[],art?:{portrait?:string;atlas?:{src:string;col:number;row:number}}):UnitDef=>({name,tier,icon,role,skill,damage,range,rate,color,recipe,portrait:art?.portrait??heroPortraits[name]??`/portraits/${portraitSlugs[name]??encodeURIComponent(name)}.png`,atlas:art?.atlas??(art?.portrait||heroPortraits[name]?undefined:heroAtlas[name])});
export const units:UnitDef[]=[
make('창병',1,'⚔','전열','긴 창 · 적에게 안정적인 피해',9,2.1,1.0,'#88a987'),make('활병',1,'🏹','궁사','속사 · 먼 적을 공격',7,3.3,1.45,'#b4c68c'),make('수병',1,'⚓','수군','물길 감시 · 강가에서 피해 증가',10,2.8,1.0,'#83b9c7'),make('포수',1,'💥','화포','화약탄 · 묵직한 한 발',17,2.6,.62,'#e8a978'),make('의병',1,'🚩','지원','결의 · 적을 늦추는 공격',6,2.5,1.1,'#d2a778'),make('기병',1,'♞','기동','돌격 · 빠른 공격',11,2.2,1.25,'#a7a6cf'),make('유생',1,'📜','책략','병법 · 아군의 사기를 돋움',5,2.7,1,'#d4c38b'),make('시민',1,'✦','만능','조합 지원 · 모든 1단계 재료를 대체',0,0,1,'#c7b58d'),
make('서희',2,'📜','책략','담판 · 적의 방어를 약화',34,3.5,1.2,'#d4c38b',['유생','수병','활병','기병']),make('온달',2,'⚔','전열','용맹 · 전열 강타',43,2.4,1.2,'#88a987',['창병','창병','기병','포수']),make('최무선',2,'💥','화포','화포 · 광역 포격',58,3.4,.8,'#e8a978',['포수','포수','유생','수병']),make('신숭겸',2,'♞','기동','철기 · 연속 돌격',45,2.6,1.3,'#a7a6cf',['기병','기병','창병','수병']),make('곽재우',2,'🚩','지원','홍의 · 적의 진군을 지연',38,3.1,1.2,'#d2a778',['의병','의병','활병','기병']),make('김시민',2,'🏹','수성','진주 수성 · 집중 사격',42,3.5,1.2,'#b4c68c',['포수','활병','활병','창병']),make('허준',2,'✚','지원','의술 · 성벽 수리 지원',24,3.0,1.1,'#83b9c7',['유생','의병','수병','수병']),make('황희',2,'📜','책략','경세 · 전투 보급',33,3.3,1.15,'#d4c38b',['유생','창병','포수','의병']),
make('선덕여왕',3,'✦','지원','지혜의 등불 · 아군 강화',108,3.9,1.25,'#d7b47c',['서희','허준','유생','활병']),make('김종서',3,'🏹','수성','북방 개척 · 성벽 집중 사격',125,3.5,1.2,'#b4c68c',['온달','최무선','수병','수병'],{atlas:heroAtlas['문무왕']}),make('정몽주',3,'📜','책략','단심가 · 전체 사기 상승',106,4,1.3,'#d4c38b',['서희','황희','유생','포수']),make('정약용',3,'💥','화포','거중기 · 강력한 화포 지원',144,4.0,1,'#e8a978',['최무선','황희','포수','수병']),
make('사명대사',3,'✚','지원','승병 · 적군 둔화',110,3.6,1.25,'#d2a778',['곽재우','허준','의병','창병']),make('윤관',3,'♞','기동','별무반 · 기병 저지',132,3.4,1.3,'#a7a6cf',['신숭겸','온달','기병','활병']),make('근구수',3,'♞','기동','백제의 돌격 · 연속 공격',132,3.4,1.3,'#a7a6cf',['신숭겸','김시민','기병','창병']),make('최치원',3,'✚','지원','계원필경 · 아군 전투 지원',110,3.8,1.3,'#d2a778',['곽재우','김시민','유생','의병']),
make('궁예',4,'📜','책략','미륵의 계책 · 적군 약화',340,4.6,1.3,'#d4c38b',['정몽주','최치원','서희','유생']),make('견훤',4,'⚔','전열','후백제의 맹공 · 전열 강타',405,3.8,1.34,'#88a987',['근구수','윤관','신숭겸','활병']),make('성왕',4,'✚','지원','백제 중흥 · 아군 전투 지원',320,4.5,1.38,'#d2a778',['선덕여왕','사명대사','허준','의병']),make('김춘추',4,'✦','책략','외교전 · 전장 통솔',315,4.3,1.35,'#d7b47c',['선덕여왕','정몽주','황희','유생']),
make('태종 이방원',4,'♛','군주','왕권 · 공격 지휘',340,4.2,1.32,'#d7b47c',['김종서','윤관','김시민','포수']),make('정도전',4,'📜','책략','조선경국전 · 방어 약화',330,4.6,1.3,'#d4c38b',['정약용','최치원','곽재우','포수']),make('계백',4,'⚔','전열','결사 · 단일 대상 강타',410,3.5,1.2,'#88a987',['김종서','사명대사','온달','창병']),make('김윤후',4,'✚','지원','승군 지휘 · 전군 화력 보조',335,4.3,1.32,'#d2a778',['정약용','근구수','최무선','수병']),
make('왕건',5,'♛','군주','후삼국 통일 · 전군 사기 상승',980,5.4,1.36,'#d7b47c',['궁예','견훤','정몽주','서희']),make('온조왕',5,'♛','군주','백제 건국 · 전열 강화',920,5.4,1.36,'#d7b47c',['성왕','정도전','최치원','황희']),make('문무왕',5,'⚓','수군','해상 지휘 · 강한 공격과 방어도 감소',1100,5.2,1.35,'#83b9c7',['김춘추','계백','선덕여왕','최무선']),make('권율',5,'🚩','수성','행주 수성 · 방어 약화와 기절',1040,5.1,1.33,'#d2a778',['계백','김윤후','사명대사','김시민']),
make('정조',5,'💥','화포','장용영 포격 · 강력한 집중 포화',1150,5.4,1.28,'#e8a978',['정도전','태종 이방원','정약용','허준']),make('장보고',5,'⚓','수군','청해진 제압 · 해상 방어 약화',1100,5.5,1.37,'#83b9c7',['김윤후','견훤','윤관','온달']),make('박혁거세',5,'♛','군주','신라 건국 · 전군 지휘',900,5.3,1.38,'#d7b47c',['김춘추','성왕','근구수','신숭겸']),make('김수로왕',5,'⚔','전열','가야 철기 · 중갑 파쇄',1120,4.7,1.35,'#88a987',['태종 이방원','궁예','김종서','곽재우']),
make('세종대왕',6,'✦','지원','지원 완성형 · 공격력과 공격속도 강화',1500,5.8,1.42,'#d7b47c',['왕건','온조왕','정도전','정몽주']),make('이성계',6,'🏹','궁사','궁사 완성형 · 약한 적 마무리',1720,5.9,1.46,'#b4c68c',['왕건','권율','태종 이방원','김종서']),make('주몽',6,'♞','기동','신궁 완성형 · 빠른 연속 사격',1720,5.8,1.52,'#a7a6cf',['온조왕','장보고','견훤','윤관']),make('진흥왕',6,'♞','기동','화랑 완성형 · 광역 돌격',1780,5.5,1.48,'#a7a6cf',['문무왕','정조','김춘추','선덕여왕']),
make('장수왕',6,'🏹','수성','평양 수성 완성형 · 견고한 방어선',1760,5.6,1.38,'#b4c68c',['문무왕','김수로왕','궁예','근구수']),make('연개소문',6,'⚔','전열','대막리지 완성형 · 높은 확률의 기절',1800,5.0,1.42,'#88a987',['권율','박혁거세','계백','사명대사']),make('척준경',6,'⚔','전열','검성 완성형 · 중갑 돌파',1850,5.1,1.40,'#88a987',['김수로왕','장보고','김윤후','정약용']),make('최영',6,'⚔','전열','황금 보검 완성형 · 전열 제압',1820,5.0,1.40,'#88a987',['박혁거세','정조','성왕','최치원']),
make('근초고왕',7,'♛','군주','10초마다 궁극기 · 칠지도 왕도 제압',2150,6.0,1.42,'#d7b47c',['세종대왕','최영','온조왕','성왕']),make('광개토대왕',7,'♞','기동','10초마다 궁극기 · 영락의 대정복',2400,5.7,1.50,'#a7a6cf',['주몽','장수왕','왕건','궁예']),make('을지문덕',7,'🌊','책략','10초마다 궁극기 · 살수 천류',2250,6.2,1.38,'#83b9c7',['진흥왕','연개소문','권율','정도전']),make('양만춘',7,'🏹','수성','10초마다 궁극기 · 안시성 낙석진',2300,5.9,1.42,'#b4c68c',['장수왕','척준경','김수로왕','김윤후']),
make('김유신',7,'⚔','전열','10초마다 궁극기 · 화랑 천하일검',2500,5.5,1.48,'#88a987',['진흥왕','세종대왕','문무왕','김춘추']),make('대조영',7,'♞','기동','10초마다 궁극기 · 천문령 대돌격',2380,5.8,1.47,'#a7a6cf',['이성계','주몽','박혁거세','견훤']),make('강감찬',7,'📜','책략','10초마다 궁극기 · 귀주대첩 역류',2200,6.3,1.40,'#d4c38b',['이성계','최영','정조','태종 이방원']),make('이순신',7,'⚓','수군','10초마다 궁극기 · 필사즉생 총공세',2450,6.2,1.43,'#83b9c7',['연개소문','척준경','장보고','계백'])
];
// Naval units trade splash for stronger single-target attacks than same-tier tacticians.
for(const unit of units)if(unit.role==='수군'){
 unit.damage=Math.max(unit.damage,Math.ceil(Math.max(0,...units.filter(u=>u.tier===unit.tier&&u.role==='책략').map(u=>u.damage))*1.2));
 if(unit.tier<7)unit.skill='해상 제압 · 단일 공격과 방어도 감소';
}
export const byName=Object.fromEntries(units.map(u=>[u.name,u])) as Record<string,UnitDef>;
// Citizens are boss-only wildcard materials and never enter the normal recruit pool.
export const basics=units.filter(u=>u.tier===1&&u.name!=='시민');
export const recipes=units.filter(u=>!!u.recipe);
export type Soldier={id:number; name:string; slot:number};
export type Enemy={id:number; name:string; hp:number; maxHp:number; progress:number; speed:number; boss:boolean; reward:number; originStage:number;originRound?:number;chapter?:ChapterId;bossSeconds?:number;armor?:number;stunSeconds?:number};
export const waveNames=chapterOneBattles.map(battle=>battle.name);
export const enemyNames=['수나라 보병','수나라 창병','수나라 궁병','수나라 기병','수나라 공성병','수나라 정예군'];
export const enemyPortraits=Object.fromEntries([...enemyNames,'수양제'].map((name,index)=>[name,{src:'/portraits/sui-enemies-atlas.png',col:index%4,row:Math.floor(index/4)}])) as Record<string,{src:string;col:number;row:number;standalone?:boolean}>;
export function createInvader(stage:number,index:number,id:number):Enemy{const level=waveCombatLevel(stage),boss=stage===FINAL_WAVE&&index===0,regularHp=55+level*38+(index%4)*18,hp=boss?(55+level*38+3*18)*10:regularHp;return {id,name:boss?'수양제':enemyNames[Math.min(5,Math.floor(level/2)+(index%3===0?1:0))],hp,maxHp:hp,progress:0,speed:boss?.025:.043+(index%4)*.003,reward:boss?850:11+level*2,boss,originStage:stage}}
export function recipeStatus(recipe:string[],owned:Soldier[]){const pool=[...owned]; return recipe.map(n=>{let i=pool.findIndex(s=>s.name===n);if(i<0&&byName[n]?.tier===1)i=pool.findIndex(s=>s.name==='시민');if(i<0)return false;pool.splice(i,1);return true})}
// The general deliberately reuses an enlarged elite soldier, rather than the emperor art.
enemyPortraits['수나라 장군']=enemyPortraits['수나라 정예군'];
for(const name of ['수나라 선봉장','수나라 공성대장','우문술','내호아','우중문','우중문 & 우문술'])enemyPortraits[name]=enemyPortraits['수나라 정예군'];
for(const [index,name] of ansiEnemyNames.entries())enemyPortraits[name]={src:'/portraits/sui-enemies-atlas.png',col:index%4,row:Math.floor(index/4)};
for(const name of [...Object.values(ansiBossNames),'당나라 장군'])enemyPortraits[name]=enemyPortraits[name==='당 태종'?'수양제':'수나라 정예군'];
for(const [index,name] of hwangsanEnemyNames.entries())enemyPortraits[name]={src:'/portraits/sui-enemies-atlas.png',col:index%4,row:Math.floor(index/4)};
for(const name of [...Object.values(hwangsanBossNames),'백제 장군'])enemyPortraits[name]=name==='계백'?byName['계백'].atlas!:enemyPortraits['수나라 정예군'];
for(const [index,name] of nadangEnemyNames.entries())enemyPortraits[name]={src:'/portraits/sui-enemies-atlas.png',col:index%4,row:Math.floor(index/4)};
for(const name of [...Object.values(nadangBossNames),'당군 장군'])enemyPortraits[name]=enemyPortraits['수나라 정예군'];
for(const [index,name] of gwijuEnemyNames.entries())enemyPortraits[name]={src:'/portraits/sui-enemies-atlas.png',col:index%4,row:Math.floor(index/4)};
for(const name of [...Object.values(gwijuBossNames),'거란 장군'])enemyPortraits[name]=enemyPortraits['수나라 정예군'];
for(const [index,name] of cheoinEnemyNames.entries())enemyPortraits[name]={src:'/portraits/sui-enemies-atlas.png',col:index%4,row:Math.floor(index/4)};
for(const name of [...Object.values(cheoinBossNames),'몽골 장군'])enemyPortraits[name]=enemyPortraits['수나라 정예군'];
for(const name of [...hansandoEnemyNames,...Object.values(hansandoBossNames),'일본 수군장'])enemyPortraits[name]={src:'/portraits/hansando-ship.png',col:0,row:0,standalone:true};
for(const name of [...haengjuEnemyNames,...Object.values(haengjuBossNames),'일본군 장군'])enemyPortraits[name]={src:'/portraits/haengju-infantry.png',col:0,row:0,standalone:true};
for(const name of [...myeongnyangEnemyNames,...Object.values(myeongnyangBossNames),'명량 일본 함장'])enemyPortraits[name]={src:'/portraits/hansando-ship.png',col:0,row:0,standalone:true};
for(const name of noryangEnemyNames)enemyPortraits[name]={src:'/portraits/hansando-ship.png',col:0,row:0,standalone:true};
for(const name of [...Object.values(noryangBossNames),'노량 일본 함장'])enemyPortraits[name]={src:'/portraits/hansando-ship.png',col:0,row:0,standalone:true};
for(const name of allStoryEnemyNames)if(!enemyPortraits[name])enemyPortraits[name]={src:'/portraits/sui-enemies-atlas.png',col:0,row:0};
for(const name of allStoryBossNames)if(!enemyPortraits[name])enemyPortraits[name]={src:'/portraits/sui-enemies-atlas.png',col:1,row:1};
for(const name of [...storyEnemyNames(10),...allStoryBossNames.filter(name=>name.includes('일본')||name==='시마즈 요시히로')])enemyPortraits[name]={src:'/portraits/hansando-ship.png',col:0,row:0,standalone:true};
export function createRoundInvader(stage:number,round:number,index:number,id:number,difficulty:Difficulty='normal',chapter:ChapterId=1):Enemy{
 const bossName=index===0?roundBossName(stage,round,chapter):null;
 const level=Math.ceil(globalRound(stage,round)/5);
 const finalBoss=!!bossName&&round===stageRoundCount(stage);
 const storyFinal=stage===10&&finalBoss;
 const {hp,armor}=enemyStats(round,index,!!bossName,storyFinal,difficulty,stage,chapter,finalBoss,stageRoundCount(stage));
 const chapterEnemies=storyEnemyNames(chapter);
 return {id,chapter,name:bossName??chapterEnemies[Math.min(5,Math.floor(level/2)+(index%3===0?1:0))],hp,maxHp:hp,armor,progress:0,speed:bossName?.025:.043+(index%4)*.003,reward:finalBoss?0:bossName?30*round:difficulty==='hard'?15:20,boss:!!bossName,originStage:stage,originRound:round};
}
// The invaders make one complete lap around the square unit field.
export const pathAt=roadPosition;
