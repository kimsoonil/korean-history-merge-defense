export const storyChapters=[
 {title:'살수대첩',year:'612년',image:'/cinematics/eulji.png'},
 {title:'안시성 전투',year:'645년',image:'/story/chapters/ansi.png'},
 {title:'황산벌 전투',year:'660년',image:'/story/chapters/hwangsan.png'},
 {title:'나당전쟁',year:'670~676년',image:'/story/chapters/nadang.png'},
 {title:'귀주대첩',year:'1019년',image:'/story/chapters/gwiju.png'},
 {title:'처인성 전투',year:'1232년',image:'/story/chapters/cheoin.png'},
 {title:'한산도대첩',year:'1592년',image:'/cinematics/yi-sunsin.png'},
 {title:'행주대첩',year:'1593년',image:'/story/chapters/haengju.png'},
 {title:'명량대첩',year:'1597년',image:'/story/chapters/myeongnyang.png'},
 {title:'남한산성 공성전',year:'1636~1637년',image:'/story/chapters/namhansan.png'},
].map((chapter,index)=>({...chapter,id:index+1,available:index<=3}));
