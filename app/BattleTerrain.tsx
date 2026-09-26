import {frontForStage} from '@/lib/campaign';
import {LoadingBackground} from './LoadingImage';

export default function BattleTerrain({stage}:{stage:number}){
 const front=frontForStage(stage);
 // Every front includes its own exterior patrol lane in the full illustration.
 // Do not inset the scene or cover the painted terrain with a flat SVG road.
 return <LoadingBackground className="board-surface integrated-terrain" src={front.id==='salsu'?'/terrain/front-salsu-selected.png':`/terrain/front-${front.id}-exterior.png`}/>;
}
