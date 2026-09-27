import {HWANGSAN_IMAGE} from '@/lib/hwangsan';
import {ANSI_IMAGE,type ChapterId} from '@/lib/ansi';
import {frontForStage} from '@/lib/campaign';
import {LoadingBackground} from './LoadingImage';

export default function BattleTerrain({stage,chapter=1}:{stage:number;chapter?:ChapterId}){
 const front=frontForStage(stage,chapter);
 // Every front includes its own exterior patrol lane in the full illustration.
 // Do not inset the scene or cover the painted terrain with a flat SVG road.
 return <LoadingBackground className="board-surface integrated-terrain" style={chapter===4?{backgroundSize:stage<=6?'106% 107%':'110% 113%',backgroundPosition:stage<=6?'45% 43%':'50% 30%'}:undefined} src={chapter===4?front.image:chapter===3?HWANGSAN_IMAGE:chapter===2?ANSI_IMAGE:front.id==='salsu'?'/terrain/front-salsu-selected.png':`/terrain/front-${front.id}-exterior.png`}/>;
}
