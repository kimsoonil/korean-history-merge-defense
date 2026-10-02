import {units,type UnitDef} from './game.ts';
import type {Difficulty} from './enemy-stats.ts';

export type ResearchTab='stats'|'support';
export type ResearchProgress=Record<string,number>;
export type AccountProgress={level:number;xp:number;accountGold:number;research:ResearchProgress};
export type ResearchKind='attack'|'speed'|'tier'|'role'|'hero'|'startGold'|'clearXp'|'clearGold'|'startTroop'|'startCitizen'|'deployLimit'|'questGold'|'questTroop'|'questCitizen'|'gambleDiscount'|'bossGold'|'bossTroop'|'bossCitizen'|'recruitDiversity';
export type ResearchNode={id:string;tab:ResearchTab;title:string;description:string;unlockLevel:number;cost:number;requires:string[];kind:ResearchKind;value:number;targets?:string[];targetTier?:number;portrait?:string;iconIndex?:number};

const masteryLevels:Record<number,number>={1:3,2:10,3:20,4:30,5:40,6:50,7:60};
const roleRows=[{level:5,roles:['전열','수군','지원']},{level:7,roles:['화포','기동','책략']},{level:9,roles:['수성','군주','궁사']}];
const roleNodes:ResearchNode[]=roleRows.flatMap(({level,roles},rowIndex)=>roles.map(role=>({id:`role-${role}`,tab:'stats' as const,title:`${role} 병법`,description:`${role} 유닛 공격력 +2%`,unlockLevel:level,cost:1500+rowIndex*500,requires:rowIndex===0?['mastery-1']:roleRows[rowIndex-1].roles.map(previous=>`role-${previous}`),kind:'role' as const,value:2,targets:[role]})));
const heroNodes:ResearchNode[]=Array.from({length:6},(_,offset)=>offset+2).flatMap(tier=>{
 const heroes=units.filter(unit=>unit.tier===tier),masteryLevel=masteryLevels[tier];
 return heroes.map((hero,index)=>({id:`hero-${hero.name}`,tab:'stats' as const,title:`유닛 연구 · ${hero.name}`,description:'공격력·공격속도 +2%',unlockLevel:masteryLevel+3+Math.floor(index/3)*3,cost:1500*tier,requires:[`mastery-${tier}`],kind:'hero' as const,value:2,targets:[hero.name],portrait:hero.name}));
});
const masteryNodes:ResearchNode[]=Array.from({length:7},(_,index)=>index+1).map(tier=>{
 const previousHeroes=tier>1?heroNodes.filter(node=>units.find(unit=>unit.name===node.portrait)?.tier===tier-1).map(node=>node.id):[];
 return {id:`mastery-${tier}`,tab:'stats',title:`Lv ${tier} 숙련`,description:`Lv ${tier} 유닛 공격력 +1%`,unlockLevel:masteryLevels[tier],cost:1000*tier,requires:tier===1?['speed-1']:tier===2?roleRows.flatMap(row=>row.roles.map(role=>`role-${role}`)):previousHeroes,kind:'tier',value:1,targetTier:tier} satisfies ResearchNode;
});

type SupportSeed=Omit<ResearchNode,'tab'|'requires'>;
const supportRows:Array<{level:number;nodes:SupportSeed[]}>= [
 {level:1,nodes:[{id:'start-gold',title:'군자금 지원',description:'전투 시작 골드 +100G',unlockLevel:1,cost:500,kind:'startGold',value:100,iconIndex:0}]},
 {level:2,nodes:[{id:'clear-xp',title:'역사 학습',description:'클리어 경험치 +5%',unlockLevel:2,cost:900,kind:'clearXp',value:5,iconIndex:1}]},
 {level:3,nodes:[{id:'clear-gold',title:'전공 포상',description:'클리어 연구금 +5%',unlockLevel:3,cost:1300,kind:'clearGold',value:5,iconIndex:2}]},
 {level:5,nodes:[{id:'start-troop',title:'추가 병력패',description:'전투 시작 병력패 +1개',unlockLevel:5,cost:2000,kind:'startTroop',value:1,iconIndex:3}]},
 {level:7,nodes:[{id:'start-citizen',title:'시민 지원군',description:'전투 시작 시민 +1명',unlockLevel:7,cost:3000,kind:'startCitizen',value:1,iconIndex:4}]},
 {level:9,nodes:[{id:'deploy-1',title:'진형 확장 I',description:'전장 배치 한도 +1명',unlockLevel:9,cost:3500,kind:'deployLimit',value:1,iconIndex:5}]},
 {level:10,nodes:[{id:'support-mastery-1',title:'지원 숙련 I',description:'전투 시작 골드 +100G',unlockLevel:10,cost:4000,kind:'startGold',value:100,iconIndex:6}]},
 {level:13,nodes:[{id:'quest-gold',title:'임무 포상',description:'매 전투 첫 퀘스트 보상 골드 +100G',unlockLevel:13,cost:4500,kind:'questGold',value:100,iconIndex:7}]},
 {level:16,nodes:[{id:'quest-troop',title:'임무 병참',description:'한 전투에서 퀘스트 3개 완료 시 병력패 +1개',unlockLevel:16,cost:5000,kind:'questTroop',value:1,iconIndex:8}]},
 {level:19,nodes:[{id:'quest-citizen',title:'민심 결집',description:'한 전투에서 퀘스트 5개 완료 시 시민 +1명',unlockLevel:19,cost:5500,kind:'questCitizen',value:1,iconIndex:9}]},
 {level:20,nodes:[{id:'support-mastery-2',title:'지원 숙련 II',description:'클리어 경험치 +5%',unlockLevel:20,cost:6000,kind:'clearXp',value:5,iconIndex:1}]},
 {level:23,nodes:[{id:'gamble-refund',title:'병력 조달 I',description:'유닛 도박 비용 5% 할인',unlockLevel:23,cost:6500,kind:'gambleDiscount',value:5,iconIndex:10}]},
 {level:26,nodes:[{id:'gamble-pity',title:'병력 조달 II',description:'유닛 도박 비용 추가 5% 할인',unlockLevel:26,cost:7000,kind:'gambleDiscount',value:5,iconIndex:11}]},
 {level:29,nodes:[{id:'reserve-gold-1',title:'예비 군자금 I',description:'전투 시작 골드 +200G',unlockLevel:29,cost:7500,kind:'startGold',value:200,iconIndex:12}]},
 {level:30,nodes:[{id:'support-mastery-3',title:'지원 숙련 III',description:'클리어 연구금 +5%',unlockLevel:30,cost:8000,kind:'clearGold',value:5,iconIndex:2}]},
 {level:33,nodes:[{id:'boss-gold',title:'대장 현상금',description:'중간 보스 처치 골드 +100G',unlockLevel:33,cost:8500,kind:'bossGold',value:100,iconIndex:13}]},
 {level:36,nodes:[{id:'boss-troop-1',title:'승전 병력 보급 I',description:'중간 보스 처치 병력패 +1개',unlockLevel:36,cost:9000,kind:'bossTroop',value:1,iconIndex:14}]},
 {level:39,nodes:[{id:'boss-citizen-1',title:'구출 작전 I',description:'중간 보스 처치 시민 +1명',unlockLevel:39,cost:9500,kind:'bossCitizen',value:1,iconIndex:15}]},
 {level:40,nodes:[{id:'support-mastery-4',title:'지원 숙련 IV',description:'전투 시작 병력패 +1개',unlockLevel:40,cost:10000,kind:'startTroop',value:1,iconIndex:3}]},
 {level:43,nodes:[{id:'recruit-diversity',title:'균형 징집',description:'병력 모집 시 직전에 모집한 유닛의 연속 등장을 방지',unlockLevel:43,cost:10500,kind:'recruitDiversity',value:1,iconIndex:16}]},
 {level:46,nodes:[{id:'reserve-gold-2',title:'예비 군자금 II',description:'전투 시작 골드 +200G',unlockLevel:46,cost:11000,kind:'startGold',value:200,iconIndex:17}]},
 {level:49,nodes:[{id:'citizen-relief',title:'백성 구휼',description:'전투 시작 시민 +1명',unlockLevel:49,cost:11500,kind:'startCitizen',value:1,iconIndex:18}]},
 {level:50,nodes:[{id:'support-mastery-5',title:'지원 숙련 V',description:'전투 시작 시민 +1명',unlockLevel:50,cost:12000,kind:'startCitizen',value:1,iconIndex:4}]},
 {level:53,nodes:[{id:'reserve-gold-3',title:'군량 창고',description:'전투 시작 골드 +200G',unlockLevel:53,cost:12500,kind:'startGold',value:200,iconIndex:19}]},
 {level:56,nodes:[{id:'reserve-troop',title:'신속 보급',description:'전투 시작 병력패 +1개',unlockLevel:56,cost:13000,kind:'startTroop',value:1,iconIndex:20}]},
 {level:59,nodes:[{id:'reserve-gold-4',title:'비상 예비대',description:'전투 시작 골드 +200G',unlockLevel:59,cost:13500,kind:'startGold',value:200,iconIndex:20}]},
 {level:60,nodes:[{id:'support-mastery-6',title:'지원 숙련 VI',description:'전장 배치 한도 +1명',unlockLevel:60,cost:14000,kind:'deployLimit',value:1,iconIndex:21}]},
 {level:63,nodes:[{id:'boss-citizen-2',title:'민심 수호',description:'중간 보스 처치 시민 +1명',unlockLevel:63,cost:14500,kind:'bossCitizen',value:1,iconIndex:21}]},
 {level:66,nodes:[{id:'boss-troop-2',title:'결전 보급',description:'중간 보스 처치 병력패 +2개',unlockLevel:66,cost:15000,kind:'bossTroop',value:2,iconIndex:22}]},
 {level:69,nodes:[{id:'victory-xp',title:'승전 기록',description:'클리어 경험치 +5%',unlockLevel:69,cost:15500,kind:'clearXp',value:5,iconIndex:23},{id:'victory-gold',title:'승전 포상',description:'클리어 연구금 +5%',unlockLevel:69,cost:15500,kind:'clearGold',value:5,iconIndex:23}]},
 {level:70,nodes:[{id:'ultimate-troop',title:'천명 지원 · 병력',description:'전투 시작 병력패 +1개',unlockLevel:70,cost:20000,kind:'startTroop',value:1,iconIndex:24},{id:'ultimate-citizen',title:'천명 지원 · 백성',description:'전투 시작 시민 +1명',unlockLevel:70,cost:20000,kind:'startCitizen',value:1,iconIndex:24}]},
];
const supportNodes:ResearchNode[]=supportRows.flatMap((row,rowIndex)=>row.nodes.map(node=>({...node,tab:'support' as const,requires:rowIndex?supportRows[rowIndex-1].nodes.map(previous=>previous.id):[]})));

export const researchNodes:ResearchNode[]=[
 {id:'attack-1',tab:'stats',title:'공격력 연구',description:'모든 유닛 공격력 +1%',unlockLevel:1,cost:500,requires:[],kind:'attack',value:1},
 {id:'speed-1',tab:'stats',title:'공격속도 연구',description:'모든 유닛 공격속도 +1%',unlockLevel:2,cost:800,requires:['attack-1'],kind:'speed',value:1},
 masteryNodes[0],...roleNodes,masteryNodes[1],
 ...heroNodes.filter(node=>units.find(unit=>unit.name===node.portrait)?.tier===2),
 ...Array.from({length:5},(_,index)=>index+3).flatMap(tier=>[masteryNodes[tier-1],...heroNodes.filter(node=>units.find(unit=>unit.name===node.portrait)?.tier===tier)]),
 {id:'attack-70',tab:'stats',title:'천명 공격력 연구',description:'모든 유닛 공격력 +2%',unlockLevel:70,cost:10000,requires:heroNodes.filter(node=>units.find(unit=>unit.name===node.portrait)?.tier===7).map(node=>node.id),kind:'attack',value:2},
 ...supportNodes,
];

export const emptyAccountProgress=():AccountProgress=>({level:1,xp:0,accountGold:0,research:{}});
export const accountFromProfile=(profile:Partial<AccountProgress>):AccountProgress=>normalizeAccount(profile);
export const xpForNextLevel=(level:number)=>100+Math.max(0,level-1)*75;
const legacyResearch:Record<string,string[]>={'tier1-attack':['mastery-1'],'role-front':['role-전열'],'role-naval':['role-수군'],'role-support':['role-지원'],'heroes-a':['hero-서희','hero-온달','hero-최무선'],'heroes-b':['hero-신숭겸','hero-곽재우','hero-김시민'],'heroes-c':['hero-허준','hero-황희']};
export function normalizeAccount(raw:Partial<AccountProgress>):AccountProgress{
 const source=raw.research&&typeof raw.research==='object'&&!Array.isArray(raw.research)?raw.research:{},migrated:ResearchProgress={};
 for(const [id,value] of Object.entries(source))if(value===1){if(researchNodes.some(node=>node.id===id))migrated[id]=1;for(const replacement of legacyResearch[id]??[])migrated[replacement]=1;}
 return {level:Number.isSafeInteger(raw.level)&&Number(raw.level)>=1?Number(raw.level):1,xp:Number.isSafeInteger(raw.xp)&&Number(raw.xp)>=0?Number(raw.xp):0,accountGold:Number.isSafeInteger(raw.accountGold)&&Number(raw.accountGold)>=0?Number(raw.accountGold):0,research:migrated};
}
export const researched=(progress:ResearchProgress,id:string)=>progress[id]===1;
export function researchAvailable(node:ResearchNode,account:AccountProgress){return account.level>=node.unlockLevel&&node.requires.every(id=>researched(account.research,id));}
export function buyResearch(account:AccountProgress,id:string){const node=researchNodes.find(item=>item.id===id);if(!node||researched(account.research,id)||!researchAvailable(node,account)||account.accountGold<node.cost)return null;return {...account,accountGold:account.accountGold-node.cost,research:{...account.research,[id]:1}};}
const sumKind=(research:ResearchProgress,kind:ResearchNode['kind'])=>researchNodes.filter(node=>node.kind===kind&&researched(research,node.id)).reduce((sum,node)=>sum+node.value,0);
export function researchAttackPercent(unit:UnitDef,research?:ResearchProgress){if(!research)return 0;return researchNodes.filter(node=>researched(research,node.id)&&(node.kind==='attack'||node.kind==='tier'&&node.targetTier===unit.tier||node.kind==='role'&&node.targets?.includes(unit.role)||node.kind==='hero'&&node.targets?.includes(unit.name))).reduce((sum,node)=>sum+node.value,0);}
export function researchSpeedPercent(research?:ResearchProgress,unit?:UnitDef){if(!research)return 0;return sumKind(research,'speed')+(unit?researchNodes.filter(node=>node.kind==='hero'&&node.targets?.includes(unit.name)&&researched(research,node.id)).reduce((sum,node)=>sum+node.value,0):0);}
export const researchStartGold=(research?:ResearchProgress)=>research?sumKind(research,'startGold'):0;
export const researchStartTroops=(research?:ResearchProgress)=>research?sumKind(research,'startTroop'):0;
export const researchStartCitizens=(research?:ResearchProgress)=>research?sumKind(research,'startCitizen'):0;
export const researchDeployLimit=(research?:ResearchProgress)=>research?sumKind(research,'deployLimit'):0;
export const researchQuestGold=(research?:ResearchProgress)=>research?sumKind(research,'questGold'):0;
export const researchQuestTroops=(research?:ResearchProgress)=>research?sumKind(research,'questTroop'):0;
export const researchQuestCitizens=(research?:ResearchProgress)=>research?sumKind(research,'questCitizen'):0;
export const researchGambleDiscountPercent=(research?:ResearchProgress)=>research?sumKind(research,'gambleDiscount'):0;
export const researchBossGold=(research?:ResearchProgress)=>research?sumKind(research,'bossGold'):0;
export const researchBossTroops=(research?:ResearchProgress)=>research?sumKind(research,'bossTroop'):0;
export const researchBossCitizens=(research?:ResearchProgress)=>research?sumKind(research,'bossCitizen'):0;
export const researchRecruitDiversity=(research?:ResearchProgress)=>!!research&&sumKind(research,'recruitDiversity')>0;
export function clearAccountReward(stage:number,chapter:number,difficulty:Difficulty,research?:ResearchProgress){const scale=difficulty==='hard'?1.5:1,baseGold=Math.round((200+stage*50+(chapter-1)*25)*scale),baseXp=Math.round((100+stage*20+chapter*5)*scale);return {gold:Math.round(baseGold*(1+(research?sumKind(research,'clearGold'):0)/100)),xp:Math.round(baseXp*(1+(research?sumKind(research,'clearXp'):0)/100))};}
export const completionReward=(reward:{gold:number;xp:number},firstClear:boolean)=>({gold:Math.round(reward.gold*(firstClear?1:.5)),xp:Math.round(reward.xp*(firstClear?1:.5))});
export function addAccountReward(account:AccountProgress,reward:{gold:number;xp:number}){let level=account.level,xp=account.xp+reward.xp;while(xp>=xpForNextLevel(level)){xp-=xpForNextLevel(level);level++;}return {...account,level,xp,accountGold:account.accountGold+reward.gold};}
