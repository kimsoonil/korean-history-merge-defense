import { type ChapterId } from "@/lib/ansi";
import { frontForStage } from "@/lib/campaign";
import { LoadingBackground } from "./LoadingImage";

export default function BattleTerrain({
  stage,
  chapter = 1,
}: {
  stage: number;
  chapter?: ChapterId;
}) {
  const front = frontForStage(stage, chapter);
  // Every front includes its own exterior patrol lane in the full illustration.
  // Do not inset the scene or cover the painted terrain with a flat SVG road.
  return (
    <LoadingBackground
      className="board-surface integrated-terrain"
      src={front.image}
    />
  );
}
