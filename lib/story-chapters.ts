export const storyChapters=[
 {title:'살수대첩',year:'612년',image:'/cinematics/eulji.png'},
 {title:'안시성 전투',year:'645년',image:'/terrain/ansi-battlefield.png'},
 {title:'황산벌 전투',year:'660년',image:'/cinematics/kim-yusin.png'},
 {title:'나당전쟁',year:'670~676년',image:'/terrain/front-pyongyang.png'},
 {title:'귀주대첩',year:'1019년',image:'/terrain/front-yodong-exterior.png'},
 {title:'처인성 전투',year:'1232년',image:'/terrain/front-emperor.png'},
 {title:'한산도대첩',year:'1592년',image:'/cinematics/yi-sunsin.png'},
 {title:'행주대첩',year:'1593년',image:'/cinematics/jeongjo.png'},
 {title:'명량대첩',year:'1597년',image:'/terrain/front-salsu.png'},
 {title:'남한산성 공성전',year:'1636~1637년',image:'/terrain/front-yodong.png'},
].map((chapter,index)=>({...chapter,id:index+1,available:index<=1}));
