import {noryangEnemyNames,noryangBossNames} from './noryang.ts';
import {haengjuEnemyNames,haengjuBossNames} from './haengju.ts';
import {hansandoEnemyNames,hansandoBossNames} from './hansando.ts';
import {cheoinEnemyNames,cheoinBossNames} from './cheoin.ts';
import {gwijuEnemyNames,gwijuBossNames} from './gwiju.ts';
import {nadangEnemyNames,nadangBossNames} from './nadang.ts';
import {hwangsanEnemyNames,hwangsanBossNames} from './hwangsan.ts';
import {ansiEnemyNames,ansiBossNames,type ChapterId} from './ansi.ts';
import {chapterOneBattles,FINAL_WAVE,waveCombatLevel} from './campaign.ts';
import {globalRound,roundBossName} from './rounds.ts';
import {roadPosition} from './battlefield.ts';
import {enemyStats,type Difficulty} from './enemy-stats.ts';
export type UnitDef = { name:string; tier:number; icon:string; role:string; skill:string; damage:number; range:number; rate:number; color:string; recipe?:string[]; portrait?:string; atlas?:{src:string;col:number;row:number} };
const portraitSlugs:Record<string,string>={창병:'spearman',활병:'archer',수병:'sailor',포수:'gunner',의병:'militia',기병:'cavalry',유생:'scholar'};
const heroSheets=[
 ['서희','온달','최무선','신숭겸','곽재우','김시민','허준','황희'],
 ['선덕여왕','문무왕','최영','정몽주','정약용','사명대사','윤관','태종 이방원'],
 ['연개소문','김춘추','대조영','왕건','강감찬','권율','계백','장보고'],
 ['이순신','세종대왕','광개토대왕','을지문덕','김유신','이성계','척준경','정조']
];
const heroAtlas=Object.fromEntries(heroSheets.flatMap((names,tier)=>names.map((name,index)=>[name,{src:`/portraits/tier-${tier+2}-atlas.png`,col:index%4,row:Math.floor(index/4)}]))) as Record<string,{src:string;col:number;row:number;standalone?:boolean}>;
const make=(name:string,tier:number,icon:string,role:string,skill:string,damage:number,range:number,rate:number,color:string,recipe?:string[]):UnitDef=>({name,tier,icon,role,skill,damage,range,rate,color,recipe,portrait:`/portraits/${portraitSlugs[name]??encodeURIComponent(name)}.png`,atlas:heroAtlas[name]});
export const units:UnitDef[]=[
make('창병',1,'⚔','전열','긴 창 · 적에게 안정적인 피해',9,2.1,1.0,'#88a987'),make('활병',1,'🏹','원거리','속사 · 먼 적을 공격',7,3.3,1.45,'#b4c68c'),make('수병',1,'⚓','수군','물길 감시 · 강가에서 피해 증가',10,2.8,1.0,'#83b9c7'),make('포수',1,'💥','화포','화약탄 · 묵직한 한 발',17,2.6,.62,'#e8a978'),make('의병',1,'🚩','지원','결의 · 적을 늦추는 공격',6,2.5,1.1,'#d2a778'),make('기병',1,'♞','기동','돌격 · 빠른 공격',11,2.2,1.25,'#a7a6cf'),make('유생',1,'📜','책략','병법 · 아군의 사기를 돋움',5,2.7,1,'#d4c38b'),
make('서희',2,'📜','책략','담판 · 적의 방어를 약화',34,3.5,1.2,'#d4c38b',['유생','수병','활병','기병']),make('온달',2,'⚔','전열','용맹 · 전열 강타',43,2.4,1.2,'#88a987',['창병','창병','기병','포수']),make('최무선',2,'💥','화포','화포 · 광역 포격',58,3.4,.8,'#e8a978',['포수','포수','유생','수병']),make('신숭겸',2,'♞','기동','철기 · 연속 돌격',45,2.6,1.3,'#a7a6cf',['기병','기병','창병','수병']),make('곽재우',2,'🚩','지원','홍의 · 적의 진군을 지연',38,3.1,1.2,'#d2a778',['의병','의병','활병','기병']),make('김시민',2,'🏹','수성','진주 수성 · 집중 사격',42,3.5,1.2,'#b4c68c',['포수','활병','활병','창병']),make('허준',2,'✚','지원','의술 · 성벽 수리 지원',24,3.0,1.1,'#83b9c7',['유생','의병','수병','수병']),make('황희',2,'📜','책략','경세 · 전투 보급',33,3.3,1.15,'#d4c38b',['유생','창병','포수','의병']),
make('선덕여왕',3,'✦','지원','지혜의 등불 · 아군 강화',108,3.9,1.25,'#d7b47c',['서희','허준','유생','활병']),make('문무왕',3,'⚓','수군','동해의 왕 · 물길 제압',125,3.5,1.2,'#83b9c7',['온달','최무선','수병','수병']),make('최영',3,'⚔','전열','황금 보검 · 중갑 파쇄',136,3.0,1.25,'#88a987',['신숭겸','김시민','기병','창병']),make('정몽주',3,'📜','책략','단심가 · 전체 사기 상승',106,4,1.3,'#d4c38b',['서희','황희','유생','포수']),make('정약용',3,'💥','화포','거중기 · 강력한 화포 지원',144,4.0,1,'#e8a978',['최무선','황희','포수','수병']),make('사명대사',3,'✚','지원','승병 · 적군 둔화',110,3.6,1.25,'#d2a778',['곽재우','허준','의병','창병']),make('윤관',3,'♞','기동','별무반 · 기병 저지',132,3.4,1.3,'#a7a6cf',['신숭겸','온달','기병','활병']),make('태종 이방원',3,'♛','군주','왕권 · 공격 지휘',119,3.7,1.25,'#d7b47c',['곽재우','김시민','의병','포수']),
make('연개소문',4,'⚔','전열','막리지 · 적진 섬멸',345,3.8,1.35,'#88a987',['문무왕','최영','온달','창병']),make('김춘추',4,'✦','책략','외교전 · 전장 통솔',315,4.3,1.35,'#d7b47c',['선덕여왕','정몽주','서희','유생']),make('대조영',4,'♞','기동','발해의 기상 · 광역 돌격',370,4.1,1.3,'#a7a6cf',['윤관','태종 이방원','신숭겸','기병','활병']),make('왕건',4,'♛','군주','개국 · 전군 사기 상승',325,4.2,1.35,'#d7b47c',['태종 이방원','사명대사','황희','수병']),make('강감찬',4,'✦','책략','귀주 · 대규모 책략 공격',360,4.6,1.2,'#d4c38b',['윤관','정몽주','허준','활병']),make('권율',4,'🚩','수성','행주 · 밀집 적군 제압',385,4.2,1.15,'#d2a778',['최영','사명대사','곽재우','포수']),make('계백',4,'⚔','전열','결사 · 단일 대상 강타',410,3.5,1.2,'#88a987',['선덕여왕','정약용','김시민','창병','의병']),make('장보고',4,'⚓','수군','청해진 · 강가 광역 공격',380,4.3,1.15,'#83b9c7',['문무왕','정약용','최무선','수병','포수']),
make('이순신',5,'⚓','수군','학익진 · 보스와 수로 적군에 막대한 피해',1100,5.2,1.35,'#83b9c7',['장보고','권율','정약용','곽재우','수병']),make('세종대왕',5,'✦','군주','훈민정음 · 모든 아군 공격 지원',940,5.3,1.35,'#d7b47c',['김춘추','왕건','선덕여왕','황희','유생']),make('광개토대왕',5,'♞','기동','광개토 · 넓은 범위 정복',1150,4.9,1.4,'#a7a6cf',['연개소문','대조영','윤관','온달','기병']),make('을지문덕',5,'🌊','책략','살수대첩 · 수나라 군대 추가 피해',1200,5.6,1.25,'#83b9c7',['연개소문','강감찬','문무왕','서희','수병']),make('김유신',5,'⚔','전열','삼국통일 · 전열 광역 공격',1080,4.8,1.4,'#88a987',['김춘추','계백','최영','신숭겸','창병']),make('이성계',5,'🏹','기동','위화도 · 원거리 일제 사격',1120,5.1,1.3,'#b4c68c',['왕건','장보고','태종 이방원','김시민','활병']),make('척준경',5,'⚔','전열','검성 · 보스 처치 특화',1300,4.3,1.35,'#88a987',['강감찬','계백','사명대사','허준','의병']),make('정조',5,'♛','군주','장용영 · 정예 화포 집중 사격',1050,5.2,1.4,'#d7b47c',['권율','대조영','정몽주','최무선','포수'])
];
// Naval units trade splash for stronger single-target attacks than same-tier tacticians.
for(const unit of units)if(unit.role==='수군'){
 unit.damage=Math.max(unit.damage,Math.ceil(Math.max(0,...units.filter(u=>u.tier===unit.tier&&u.role==='책략').map(u=>u.damage))*1.2));
 unit.skill='해상 제압 · 단일 공격과 방어도 감소';
}
export const byName=Object.fromEntries(units.map(u=>[u.name,u])) as Record<string,UnitDef>;
export const basics=units.filter(u=>u.tier===1);
export const recipes=units.filter(u=>!!u.recipe);
export type Soldier={id:number; name:string; slot:number};
export type Enemy={id:number; name:string; hp:number; maxHp:number; progress:number; speed:number; boss:boolean; reward:number; originStage:number;chapter?:ChapterId;bossSeconds?:number;armor?:number;stunSeconds?:number};
export const waveNames=chapterOneBattles.map(battle=>battle.name);
export const enemyNames=['수나라 보병','수나라 창병','수나라 궁병','수나라 기병','수나라 공성병','수나라 정예군'];
export const enemyPortraits=Object.fromEntries([...enemyNames,'수양제'].map((name,index)=>[name,{src:'/portraits/sui-enemies-atlas.png',col:index%4,row:Math.floor(index/4)}])) as Record<string,{src:string;col:number;row:number;standalone?:boolean}>;
export function createInvader(stage:number,index:number,id:number):Enemy{const level=waveCombatLevel(stage),boss=stage===FINAL_WAVE&&index===0,regularHp=55+level*38+(index%4)*18,hp=boss?(55+level*38+3*18)*10:regularHp;return {id,name:boss?'수양제':enemyNames[Math.min(5,Math.floor(level/2)+(index%3===0?1:0))],hp,maxHp:hp,progress:0,speed:boss?.025:.043+(index%4)*.003,reward:boss?850:11+level*2,boss,originStage:stage}}
export function recipeStatus(recipe:string[],owned:Soldier[]){const pool=[...owned]; return recipe.map(n=>{const i=pool.findIndex(s=>s.name===n);if(i<0)return false;pool.splice(i,1);return true})}
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
for(const name of noryangEnemyNames)enemyPortraits[name]={src:'/portraits/hansando-ship.png',col:0,row:0,standalone:true};
for(const name of [...Object.values(noryangBossNames),'노량 일본 함장'])enemyPortraits[name]={src:'/portraits/hansando-ship.png',col:0,row:0,standalone:true};
export function createRoundInvader(stage:number,round:number,index:number,id:number,difficulty:Difficulty='normal',chapter:ChapterId=1):Enemy{
 const bossName=index===0?roundBossName(stage,round,chapter):null;
 const level=Math.ceil(globalRound(stage,round)/5);
 const {hp,armor}=enemyStats(round,index,!!bossName,(bossName==='수양제'||bossName==='당 태종'||bossName==='계백'||bossName==='설인귀'||bossName==='소배압'||bossName==='살리타'||bossName==='와키자카 야스하루'||bossName==='우키타 히데이에'||bossName==='시마즈 요시히로'),difficulty);
 return {id,chapter,name:bossName??(chapter===10?noryangEnemyNames:chapter===8?haengjuEnemyNames:chapter===7?hansandoEnemyNames:chapter===6?cheoinEnemyNames:chapter===5?gwijuEnemyNames:chapter===4?nadangEnemyNames:chapter===3?hwangsanEnemyNames:chapter===2?ansiEnemyNames:enemyNames)[Math.min(5,Math.floor(level/2)+(index%3===0?1:0))],hp,maxHp:hp,armor,progress:0,speed:bossName?.025:.043+(index%4)*.003,reward:bossName?30*round:difficulty==='hard'?15:20,boss:!!bossName,originStage:stage};
}
// The invaders make one complete lap around the square unit field.
export const pathAt=roadPosition;
