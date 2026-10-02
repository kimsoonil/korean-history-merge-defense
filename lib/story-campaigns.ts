import type {ChapterId} from './ansi.ts';

export type StoryDialogue={speaker:string;text:string};
export type StoryStage={number:number;title:string;year:string;guide:string;intro:string;dialogue:string};
export type ReinforcementPlan={hero:string;arrival:string;bossReply:string;halfHp:string;contribution:number;image:string};
export type StoryCampaign={
 id:ChapterId;slug:string;title:string;year:string;stageCount:10;coverImage:string;arrivalImage:string;
 arrivalTitle:string;journalHeading:string;journalSummary:(nickname:string)=>string;
 arrival:(step:number,nickname:string)=>StoryDialogue;stages:readonly StoryStage[];
 victory:string;finalBoss:string;epilogue:{heading:string;summary:string;image:string;pages:(nickname:string)=>StoryDialogue[]};
 reinforcement:ReinforcementPlan;frontTitles?:readonly [string,string,string,string];
};

type StorySeed={
 id:ChapterId;slug:string;title:string;year:string;place:string;guide:string;enemy:string;finalBoss:string;
 cover:string;arrivalImage:string;epilogueImage:string;heading:string;summary:string;crisis:string;mission:string;
 stageTitles:readonly string[];stageYears?:readonly string[];stageGuides?:readonly string[];
 stageIntros?:readonly string[];stageDialogues?:readonly string[];
 frontTitles?:readonly [string,string,string,string];
 victory:string;enemyLastLine:string;heroLastLine:string;crowd:string;lesson:string;
 reinforcement:[arrival:string,bossReply:string,halfHp:string,contribution:number];
};

const makeArrival=(seed:StorySeed)=>(step:number,name:string):StoryDialogue=>[
 {speaker:'책의 정령',text:`${name}, 천명도첩이 ${seed.year}의 ${seed.title} 기록을 열었다.`},
 {speaker:name,text:`여기가 ${seed.place}… 서책에서 보던 전장이 눈앞에 펼쳐져 있어.`},
 {speaker:'책의 정령',text:seed.crisis},
 {speaker:seed.guide,text:`낯선 이여, 그대가 ${name}인가. 우리와 함께 이 역사의 갈림길을 지켜 주겠는가?`},
 {speaker:'책의 정령',text:`${seed.mission} 전선 지도에서 첫 스테이지를 선택하자.`},
 ][step];
const makeEpilogue=(seed:StorySeed)=>(name:string):StoryDialogue[]=>[
 {speaker:'서술',text:`${seed.place}을 뒤덮었던 함성이 잦아들고 전장의 연기가 천천히 걷힙니다.`},
 {speaker:seed.finalBoss,text:seed.enemyLastLine},
 {speaker:seed.guide,text:seed.heroLastLine},
 {speaker:seed.finalBoss,text:'오늘의 패배를 인정한다. 남은 병력을 거두어 물러가겠다.'},
 {speaker:seed.guide,text:'추격보다 부상자와 백성을 돌보는 일이 먼저다. 전열을 정리하고 살아남은 이들을 살펴라.'},
 {speaker:'병사들',text:seed.crowd},
 {speaker:seed.guide,text:`${name}, 시대를 넘어 우리와 함께 싸워 주어 고맙다. 그대의 이름도 이 기록에 남을 것이다.`},
 {speaker:name,text:'끝난 거야? 환호와 슬픔이 함께 들려. 승리만 기억해서는 안 될 것 같아.'},
 {speaker:'책의 정령',text:`그래, ${name}. ${seed.lesson} 지워지던 기록이 천명도첩에 다시 새겨졌다.`},
 {speaker:name,text:'이곳에서 살아간 사람들의 마음까지 빠짐없이 남겨 줘. 이제 다음 장으로 돌아가자.'},
 ];
const makeCampaign=(seed:StorySeed):StoryCampaign=>{
 if(seed.stageTitles.length!==10)throw new Error(`${seed.title} must have ten stages`);
 const stages=seed.stageTitles.map((title,index)=>({
  number:index+1,title,year:seed.stageYears?.[index]??seed.year,guide:seed.stageGuides?.[index]??seed.guide,
  intro:seed.stageIntros?.[index]??`${title} 전선에 적군이 집결했습니다.`,dialogue:seed.stageDialogues?.[index]??`${title}의 방어선을 지키고 다음 전선으로 나아가라!`,
 }));
 return {...seed,stageCount:10,coverImage:seed.cover,arrivalImage:`/story/cinematics-mobile/${seed.slug}-opening.jpg`,arrivalTitle:`${seed.year} · ${seed.place}`,
  journalHeading:seed.heading,journalSummary:name=>`${name}, ${seed.summary}`,arrival:makeArrival(seed),stages,
  epilogue:{heading:seed.heading,summary:seed.summary,image:`/story/cinematics-mobile/${seed.slug}-epilogue.jpg`,pages:makeEpilogue(seed)},
  reinforcement:{hero:seed.guide,arrival:seed.reinforcement[0],bossReply:seed.reinforcement[1],halfHp:seed.reinforcement[2],contribution:seed.reinforcement[3],image:seed.epilogueImage}};
};

const seeds:readonly StorySeed[]=[
 {id:1,slug:'pyongyang',title:'평양성 전투',year:'371년',place:'평양성',guide:'근초고왕',enemy:'고구려군',finalBoss:'고국원왕',cover:'/story/chapters-v2/pyongyang.png',arrivalImage:'/story/cinematics-mobile/pyongyang-opening.jpg',epilogueImage:'/story/epilogues-v2/pyongyang-victory.png',heading:'성벽에 남은 두 나라의 기억',summary:'백제군의 북진과 고구려의 방어가 평양성에서 충돌합니다.',crisis:'백제군의 북진과 고구려의 방어가 평양성에서 충돌하려 한다. 이 전투는 두 나라의 세력 판도를 크게 바꿀 것이다.',mission:'패하를 건너 성문 공방과 왕성 결전을 돌파하라.',stageTitles:['한성 출정','예성강 진군','패하 도하','평양성 외곽','남문 공방','고구려 기병대','성벽 쟁탈전','왕성 압박','고국원왕 친위대','평양성 결전'],victory:'평양성 전투 승리! 백제군이 북방 원정을 완수했습니다.',enemyLastLine:'이 성을 지키지 못했으나 고구려의 뜻까지 꺾인 것은 아니다.',heroLastLine:'오늘의 승리는 수많은 병사의 희생 위에 있다. 경솔히 기뻐하지 말라.',crowd:'평양성의 전투가 끝났다! 부상자를 거두고 전우를 찾아라!',lesson:'평양성 전투는 승자의 영광과 두 나라가 치른 대가를 함께 보여 준다.',reinforcement:['백제의 군세가 여기까지 왔다. 평양성의 결전을 끝내겠다!','근초고왕, 고구려의 왕성이 그대에게 무너질 것 같으냐!','적의 친위대가 흔들린다. 전열을 모아 마지막 길을 열어라!',.35]},
 {id:2,slug:'goguryeo-conquests',title:'고구려의 정복 전쟁',year:'392~410년',place:'고구려의 여러 전선',guide:'광개토대왕',enemy:'연합 적군',finalBoss:'동부여 왕',cover:'/story/chapters-v2/goguryeo-conquests.png',arrivalImage:'/story/cinematics-mobile/goguryeo-conquests-opening.jpg',epilogueImage:'/story/epilogues-v2/goguryeo-conquests-victory.png',heading:'영락의 땅에 오른 아침',summary:'관미성에서 신라 구원, 요동과 동부여까지 광개토대왕의 여러 전선을 따라갑니다.',crisis:'백제의 요새와 왜군의 침입, 북방 세력의 위협이 고구려와 동맹국을 압박하고 있다.',mission:'남방과 북방의 여러 전선을 잇고 마지막 동부여 원정을 완수하라.',stageTitles:['관미성 정찰','관미성 공략','백제 북방선','한성 압박','아신왕의 항복','신라의 구원 요청','신라 구원전','가야 추격전','요동 확보전','동부여 원정'],stageYears:['392년','392년','395년','396년','396년','399년','400년','400년','404년','410년'],victory:'고구려의 정복 전쟁 승리! 남방과 요동, 동부여의 전선이 정리되었습니다.',enemyLastLine:'더 싸운다면 백성만 다칠 것이다. 성문을 열고 군을 거두겠다.',heroLastLine:'넓어진 영토보다 그 안의 백성을 지키는 일이 더 중요하다. 약탈을 금하라.',crowd:'영락의 군대가 돌아온다! 흩어진 가족과 전우를 맞이하라!',lesson:'광개토대왕의 전쟁은 정복뿐 아니라 동맹을 구하고 새로운 질서를 세운 과정이었다.',reinforcement:['영락의 깃발 아래 모든 전선을 하나로 잇겠다. 북방 원정을 끝내자!','고구려의 왕이 직접 왔는가. 동부여의 성은 쉽게 열리지 않는다!','적의 성문이 흔들린다. 백성을 해치지 말고 항복을 받아라!',.35]},
 {id:3,slug:'salsu',title:'살수대첩',year:'612년',place:'요동성과 살수',guide:'을지문덕',enemy:'수나라군',finalBoss:'수양제',cover:'/cinematics/eulji.png',arrivalImage:'/story/cinematics-mobile/salsu-opening.jpg',epilogueImage:'/story/salsu-victory.png',heading:'살수에 울려 퍼진 함성',summary:'요동성에서 평양성, 살수로 이어지는 고구려의 방어전입니다.',crisis:'수나라의 대군이 요동성과 평양성을 압박하고 있다. 적의 보급이 무너지는 순간까지 버텨야 한다.',mission:'청야 작전과 유인전을 거쳐 살수에서 침략군을 물리쳐라.',stageTitles:['요동성 성문','요동성 공성전','요동 방어선','평양성 청야','평양성 외곽','별동대 유인','살수 진입','살수 도하전','별동대 패잔병','수양제 최종전'],victory:'살수대첩 대승리! 고구려가 수나라의 침략을 물리쳤습니다.',enemyLastLine:'대군을 보냈거늘 어찌 살아 돌아온 자가 이토록 적단 말이냐!',heroLastLine:'백성을 짓밟은 군대는 수가 많아도 끝내 뜻을 이루지 못한다.',crowd:'살수를 지켜냈다! 고구려 만세!',lesson:'살수대첩은 수적 열세를 지형과 보급, 치밀한 계책으로 뒤집은 승리였다.',reinforcement:['살수의 물결은 이미 우리 편이다. 이제 이 침략을 끝내겠다!','을지문덕, 네 계책도 천자의 대군 앞에서는 소용없다!','적의 대열이 흔들린다. 지금이 마지막 반격의 때다!',.35]},
 {id:4,slug:'ansi',title:'안시성 전투',year:'645년',place:'안시성',guide:'양만춘',enemy:'당나라군',finalBoss:'당 태종',cover:'/story/chapters/ansi.png',arrivalImage:'/terrain/ansi-battlefield.png',epilogueImage:'/story/epilogues/ansi-victory.png',heading:'끝내 무너지지 않은 성',summary:'성문과 성벽, 토산을 둘러싼 안시성의 항전을 따라갑니다.',crisis:'당 태종의 대군이 안시성을 포위하고 거대한 공성 무기와 토산으로 압박하고 있다.',mission:'군민과 함께 모든 공세를 견디고 당군을 철수시켜라.',stageTitles:['요동 방면 정찰','안시성 성문','성벽 방어전','공성 병기전','야간 기습','장기 포위','토산 축조','토산 쟁탈','당군 총공세','당 태종 최종전'],victory:'안시성 방어 성공! 고구려의 군민이 당나라의 공세를 막아냈습니다.',enemyLastLine:'토산까지 쌓고도 이 성 하나를 넘지 못하다니, 군을 거두겠다.',heroLastLine:'높은 벽보다 이곳 사람들의 뜻이 성을 지켜 냈다.',crowd:'안시성이 무너지지 않았다! 모두가 함께 지켜 냈다!',lesson:'안시성은 오랜 포위 속에서도 군민이 힘을 합치면 버틸 수 있음을 보여 주었다.',reinforcement:['안시성의 군민이 아직 버티고 있다. 성벽은 결코 무너지지 않는다!','성주가 직접 나섰구나. 마지막 공세로 성문을 열어라!','당군의 기세가 꺾였다. 성벽 위의 모든 활을 집중하라!',.35]},
 {id:5,slug:'hwangsan',title:'황산벌 전투',year:'660년',place:'황산벌',guide:'김유신',enemy:'백제군',finalBoss:'계백',cover:'/story/chapters/hwangsan.png',arrivalImage:'/story/chapters/hwangsan.png',epilogueImage:'/story/epilogues/hwangsan-remembrance.png',heading:'황산벌에 남은 이름들',summary:'김유신의 신라군과 계백의 결사대가 맞선 황산벌의 기록입니다.',crisis:'백제의 결사대가 좁은 길목을 막고 신라군은 여러 차례 공격에도 전진하지 못하고 있다.',mission:'결사대의 방어를 넘어 백제 도성으로 향하는 길을 열어라.',stageTitles:['탄현 진입','황산벌 전초전','백제 기병대','첫 번째 총공세','화랑의 돌격','계백의 반격','중앙 돌파전','결사대 포위','계백 친위대','황산벌 결전'],victory:'황산벌 전투 승리! 신라군이 백제 도성으로 향하는 길을 열었습니다.',enemyLastLine:'백제의 마지막을 막지 못했으나 끝까지 맞선 뜻은 사라지지 않을 것이다.',heroLastLine:'장군과 결사대의 충정을 가볍게 여기지 않겠소.',crowd:'오늘 이곳에서 싸운 모두를 기억하자!',lesson:'황산벌은 승패만으로 설명할 수 없는 충정과 희생을 남겼다.',reinforcement:['화랑의 뜻을 하나로 모아 황산벌의 길을 열겠다!','김유신, 오늘 이 들판에서 서로의 모든 것을 걸어 보자!','물러서지 마라. 쓰러진 이들의 뜻까지 품고 전진하라!',.35]},
 {id:6,slug:'nadang',title:'나당전쟁',year:'670~676년',place:'매소성과 기벌포',guide:'문무왕',enemy:'당나라군',finalBoss:'설인귀',cover:'/story/chapters/nadang.png',arrivalImage:'/story/chapters/nadang.png',epilogueImage:'/story/epilogues/nadang-victory.png',heading:'육지와 바다의 항전',summary:'매소성에서 기벌포까지 신라가 당의 지배에 맞선 전쟁입니다.',crisis:'당이 옛 백제와 고구려 땅을 직접 지배하려 하며 신라와의 동맹을 깨뜨렸다.',mission:'육상과 해상의 방어선을 이어 당군을 한반도 밖으로 물리쳐라.',stageTitles:['웅진도독부 전선','백제 고지 탈환','석문 전투','임진강 방어선','칠중성 공방','매소성 전초전','매소성 대승','기벌포 접근','기벌포 해전','설인귀 최종전'],stageYears:['670년','671년','672년','673년','675년','675년','675년','676년','676년','676년'],victory:'나당전쟁 승리! 신라가 매소성과 기벌포에서 당군을 물리쳤습니다.',enemyLastLine:'매소성에서도 이 물길에서도 진격이 막히다니, 철수한다.',heroLastLine:'이 땅의 운명은 다른 나라가 아니라 우리가 지킬 것이다.',crowd:'매소성과 기벌포를 지켜냈다!',lesson:'나당전쟁은 동맹 이후에도 스스로의 터전과 질서를 지키려 한 싸움이었다.',reinforcement:['이 땅의 운명은 우리가 지킨다. 육군과 수군은 함께 전진하라!','문무왕이 직접 왔는가. 당의 대군을 막을 수는 없을 것이다!','기벌포의 물길을 장악했다. 남은 적선의 퇴로를 끊어라!',.27]},
 {id:7,slug:'cheonmunryeong',title:'천문령 전투',year:'698년',place:'천문령',guide:'대조영',enemy:'주나라 추격군',finalBoss:'이해고',cover:'/story/chapters-v2/cheonmunryeong.png',arrivalImage:'/story/arrivals-v2/cheonmunryeong.png',epilogueImage:'/story/epilogues-v2/cheonmunryeong-victory.png',heading:'산길 너머의 새 나라',summary:'대조영과 고구려 유민들이 추격을 피해 천문령에서 새로운 터전을 향합니다.',crisis:'고구려 유민과 말갈 세력이 동쪽으로 이동하는 가운데 이해고의 추격군이 산길까지 따라붙었다.',mission:'피난민을 보호하고 산악 지형을 이용해 추격군을 물리쳐라.',stageTitles:['영주 탈출','요수 도하','동모산으로 가는 길','말갈 연합군','추격군 선봉','천문령 입구','협곡 매복','걸사비우의 전선','이해고 친위대','천문령 결전'],stageYears:['696년','697년','697년','697년','698년','698년','698년','698년','698년','698년'],victory:'천문령 전투 승리! 대조영과 유민들이 발해 건국으로 향하는 길을 열었습니다.',enemyLastLine:'추격군이 무너졌다. 더는 저들을 붙잡을 수 없겠구나.',heroLastLine:'오늘 지켜 낸 것은 한 번의 승리가 아니라 우리 백성의 내일이다.',crowd:'살아남았다! 이제 새로운 터전으로 간다!',lesson:'천문령 전투는 고구려 유민이 절망 속에서 발해라는 새로운 나라로 나아간 전환점이었다.',reinforcement:['이 산길 뒤에는 백성과 새로운 나라의 미래가 있다. 한 걸음도 물러서지 마라!','대조영, 이 천문령에서 너희의 도주를 끝내겠다!','추격군의 기병이 갇혔다. 능선의 모든 부대는 돌격하라!',.35]},
 {id:8,slug:'goryeo-khitan',title:'고려거란 전쟁',year:'993~1019년',place:'고려 북방',guide:'강감찬',enemy:'거란군',finalBoss:'소배압',cover:'/story/chapters-v2/goryeo-khitan.png',arrivalImage:'/story/cinematics-mobile/goryeo-khitan-opening.jpg',epilogueImage:'/story/epilogues-v2/goryeo-khitan-victory.png',heading:'세 차례 침입을 막은 고려',summary:'서희의 담판에서 흥화진과 귀주의 결전까지 고려와 거란의 긴 전쟁을 따라갑니다.',crisis:'거란군이 대군을 이끌고 고려의 북방을 넘어오려 한다. 싸움뿐 아니라 외교와 보급, 성곽 방어가 모두 필요하다.',mission:'세 차례 침입의 주요 전선을 지나 귀주에서 긴 전쟁을 끝내라.',stageTitles:['봉산군 방어','안융진 전선','서희의 담판','강동 6주 개척','흥화진 수공','통주 추격전','개경 청야','반송 매복','귀주 포위','귀주대첩'],stageYears:['993년','993년','994년','994년','1018년','1018년','1019년','1019년','1019년','1019년'],stageGuides:['서희','서희','서희','서희','강감찬','강감찬','강감찬','강감찬','강감찬','강감찬'],victory:'고려거란 전쟁 승리! 세 차례의 침입을 이겨 내고 고려의 북방을 지켰습니다.',enemyLastLine:'고려의 포위망을 뚫을 수 없다. 남은 군을 거두어 돌아간다.',heroLastLine:'싸움은 오늘 끝났지만 국경을 지키는 준비는 내일부터 다시 시작된다.',crowd:'귀주를 지켜냈다! 고려가 긴 전쟁을 이겨 냈다!',lesson:'고려거란 전쟁은 외교와 성곽, 끈질긴 준비와 지휘가 함께 나라를 지킨 역사였다.',reinforcement:['기다리던 때가 왔다. 모든 군은 적의 퇴로를 끊어라!','강감찬의 매복인가! 기병을 모아 포위망을 돌파하라!','적의 보급과 대열이 모두 무너졌다. 귀주에서 끝을 내자!',.35]},
 {id:9,slug:'cheoin',title:'처인성 전투',year:'1232년',place:'처인성',guide:'김윤후',enemy:'몽골군',finalBoss:'살리타',cover:'/story/chapters/cheoin.png',arrivalImage:'/story/chapters/cheoin.png',epilogueImage:'/story/epilogues/cheoin-victory.png',heading:'작은 성에 모인 의지',summary:'김윤후와 처인부곡 주민들이 작은 토성에서 몽골군에 맞섭니다.',crisis:'몽골군 지휘관 살리타가 남하하며 작은 처인성을 공격하려 한다. 성 안에는 군사보다 평범한 주민이 더 많다.',mission:'주민과 승병의 힘을 모아 모든 공세를 막아 내라.',stageTitles:['처인성 집결','남쪽 목책','구릉 방어선','몽골 궁기병','야간 공세','공성대 접근','주민 의병대','살리타의 포위','승병의 반격','처인성 결전'],victory:'처인성 전투 승리! 주민과 승병이 힘을 모아 몽골군의 공세를 막았습니다.',enemyLastLine:'이 작은 성에서 진격이 멈추다니, 병력을 물려라.',heroLastLine:'성을 지킨 힘은 높은 벽이 아니라 서로를 포기하지 않은 마음이었다.',crowd:'우리가 가족과 이웃을 지켜 냈다!',lesson:'처인성은 이름 없는 백성과 승병의 용기가 역사를 움직일 수 있음을 보여 주었다.',reinforcement:['높은 벽이 없어도 서로를 지키려는 마음은 무너지지 않는다!','승려 한 사람이 우리 진격을 막겠다는 것이냐!','처인성의 모두가 함께 싸우고 있다. 마지막까지 자리를 지켜라!',.27]},
 {id:10,slug:'imjin-war',title:'임진왜란',year:'1592~1597년',place:'한산도에서 명량까지',guide:'이순신',enemy:'일본군',finalBoss:'구루시마 미치후사',cover:'/story/chapters-v2/imjin-war.png',arrivalImage:'/story/arrivals-v2/imjin-war.png',epilogueImage:'/story/epilogues-v2/imjin-war-victory.png',heading:'바다와 산성을 지킨 사람들',summary:'한산도·진주성·행주·명량에서 조선 수군과 관군, 의병과 백성이 함께 버틴 네 번의 대첩을 따라갑니다.',crisis:'일본군이 육지와 바다에서 조선을 압박하고 있다. 수군의 제해권과 진주성·행주산성의 방어선이 모두 무너지지 않도록 지켜야 한다.',mission:'한산도와 진주성, 행주산성을 거쳐 명량의 거센 물살에서 마지막 적 지휘선을 격파하라.',frontTitles:['한산도 대첩','진주성 대첩','행주대첩','명량대첩'],stageTitles:['한산도 대첩','견내량 유인전','학익진 포위전','진주성 대첩','진주성 성벽 방어','김시민의 반격','행주대첩','행주산성 총공세','권율의 총반격','명량대첩'],stageYears:['1592년','1592년','1592년','1592년','1592년','1592년','1593년','1593년','1593년','1597년'],stageGuides:['이순신','이순신','이순신','김시민','김시민','김시민','권율','권율','권율','이순신'],stageIntros:['이순신 장군이 학익진 전술로 왜 수군의 주력을 격멸하고 남해의 제해권을 장악해야 합니다.','좁은 견내량에 숨은 적 선단을 넓은 한산도 앞바다로 유인하십시오.','학익진의 양 날개를 펼쳐 포위망에 들어온 왜선을 격파하십시오.','김시민 장군이 이끄는 3,800여 명의 군사가 2만 명의 왜군을 맞아 진주성을 지킵니다.','왜군이 사다리와 공성 장비로 성벽에 접근합니다. 성문과 성벽을 사수하십시오.','수적으로 우세한 적의 대열이 흔들립니다. 김시민의 지휘 아래 반격하십시오.','권율 장군과 승병·의병·백성이 행주산성에서 일본군의 공세를 막아 냅니다.','일본군이 행주산성에 총공세를 시작했습니다. 화차와 총통으로 방어선을 지키십시오.','행주치마로 돌을 나른 백성과 모든 병력이 힘을 모아 마지막 반격에 나섭니다.','삼도수군통제사로 돌아온 이순신 장군이 13척의 배로 133척의 왜선을 명량에서 맞이합니다.'],stageDialogues:['적 선단을 넓은 바다로 끌어내 학익진을 펼쳐라!','적이 유인을 따라 나온다. 함선의 간격을 유지하라!','포위망이 완성되었다. 모든 화포를 적의 중심에 집중하라!','군사와 백성이 함께 버틴다. 단 한 명도 성벽을 넘게 하지 마라!','성문과 성벽을 오가는 병력을 나누어 공성대를 막아라!','적의 기세가 꺾였다. 성문을 열고 일제히 반격하라!','높은 지형을 지키고 승병과 의병의 대열을 하나로 모아라!','화차와 총통을 준비하라. 신호에 맞춰 일제히 발사한다!','모두가 나른 돌 하나까지 힘이 된다. 적을 산성 아래로 밀어내라!','필사즉생 필생즉사. 울돌목의 물살과 13척의 전선을 믿고 싸워라!'],victory:'임진왜란 네 대첩 승리! 한산도와 진주성, 행주와 명량의 방어선을 모두 지켜냈습니다.',enemyLastLine:'수백 척의 함대가 고작 열세 척을 넘지 못하다니… 명량의 물살이 우리를 삼키는구나.',heroLastLine:'아직 전쟁은 끝나지 않았으나 오늘 이 바다에서 백성과 나라가 다시 버틸 시간을 얻었다.',crowd:'명량을 지켜냈다! 한산도와 진주성, 행주에서 이어진 뜻이 끝내 승리를 만들었다!',lesson:'임진왜란의 네 대첩은 뛰어난 지휘뿐 아니라 군사와 의병, 승병과 백성이 각자의 자리에서 함께 버틴 결과였다.',reinforcement:['아직 열세 척의 전선이 남아 있다. 내가 선두에서 명량의 물길을 지키겠다!','이순신이 다시 나타났는가. 수적 우세로 단숨에 짓밟아라!','적의 대열이 울돌목에서 엉키고 있다. 지금 모든 화포를 집중하라!',.35]},
] as const;

export const storyCampaigns:readonly StoryCampaign[]=seeds.map(makeCampaign);
export const getStoryCampaign=(chapter:ChapterId)=>storyCampaigns[chapter-1];
export const getStoryStage=(chapter:ChapterId,stage:number)=>getStoryCampaign(chapter).stages[Math.max(0,Math.min(9,stage-1))];
export const reinforcementFor=(chapter:ChapterId,difficulty:'normal'|'hard',stage:number)=>difficulty==='normal'&&stage===10?getStoryCampaign(chapter).reinforcement:null;

export type ReinforcementProgress={chapter:ChapterId;hero:string;damageDealt:number;halfSpoken:boolean};
export function validReinforcement(value:unknown,chapter:ChapterId,difficulty:'normal'|'hard',stage:number):value is ReinforcementProgress{
 if(!value||typeof value!=='object'||difficulty!=='normal'||stage!==10)return false;
 const data=value as Partial<ReinforcementProgress>,plan=getStoryCampaign(chapter).reinforcement;
 return data.chapter===chapter&&data.hero===plan.hero&&typeof data.damageDealt==='number'&&Number.isFinite(data.damageDealt)&&data.damageDealt>=0&&typeof data.halfSpoken==='boolean';
}
export function reinforcementDamage(plan:ReinforcementPlan,bossMaxHp:number,elapsedSeconds:number,alreadyDealt:number){
 const cap=bossMaxHp*plan.contribution,perSecond=cap/70;
 return Math.max(0,Math.min(cap-alreadyDealt,perSecond*Math.max(0,elapsedSeconds)));
}
