import { storyEpilogue } from "./story-epilogue.ts";
export { SALSU_EPILOGUE_IMAGE, type EpiloguePage } from "./story-epilogue.ts";
export const salsuEpilogue = (nickname: string) => storyEpilogue(3, nickname);
