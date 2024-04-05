const GameBoy = require("../../serverboy");
import { readFileSync } from "fs";
import ServerBoy from "../../types/serverboy";
import { CREDIT, EMPTY_FRAME_160_144 } from "../constants/frame";
import GIFEncoder from "gifencoder";
import sharp from "sharp";

declare global {
  var gbaManager: GbaManager;
}

const rootDir = process.cwd();

export class GbaManager {
  private instancese: Record<number, ServerBoy> = {};

  private static instance: GbaManager;

  private constructor() {
    // private to prevent direct construction calls with the `new` operator.
  }

  public getGameboy(fid: number) {
    if (this.instancese[fid]) {
      return this.instancese[fid];
    }
    const gameboy: ServerBoy = new GameBoy();

    this.instancese[fid] = gameboy;
    return gameboy;
  }

  public startGame(fid: number, game: `${string}.gbc`) {
    const gameboy = this.getGameboy(fid);
    const rom = readFileSync(`${rootDir}/roms/${game}`);
    // check for existing state  exists in /saves/[fid].json
    let saveState = readFileSync(`${rootDir}/states/start.json`);
    try {
      saveState = readFileSync(`${rootDir}/saves/${game}/${fid}.json`);
    } catch (error) {}

    const parsed = JSON.parse(saveState.toString());
    gameboy.load(rom, parsed);
  }

  public static getInstance(): GbaManager {
    if (globalThis.gbaManager) {
      return globalThis.gbaManager;
    }
    if (!GbaManager.instance) {
      GbaManager.instance = new GbaManager();
      globalThis.gbaManager = GbaManager.instance;
    }
    return GbaManager.instance;
  }

  public async generateGif(fid: number) {
    const gameboy = this.getGameboy(fid);
    const frameRenderCount = 5;
    const start = Date.now();

    // Create a GIFEncoder instance.
    const encoder = new GIFEncoder(160, 160); // Change the dimensions as needed.
    // encoder.setDelay(1000 / 60); // 60 FPS
    encoder.setQuality(10);
    encoder.setRepeat(0);
    encoder.start();

    for (let i = 0; i < frameRenderCount; i++) {
      gameboy.doFrame();
      gameboy.doFrame();
      gameboy.doFrame();
      const screen = gameboy.getScreen();
      const rgbaArray: number[] = structuredClone(EMPTY_FRAME_160_144);
      // const top8Rows = 160 * 8 * 4;
      for (let i = 0; i < screen.length; i++) {
        rgbaArray[i] = screen[i];
      }
      // console.log(rgbaArray.length);
      rgbaArray.push(...CREDIT);
      const img = await Buffer.from(rgbaArray);

      // console.log(rgbaArray.length);
      encoder.addFrame(img as any);
    }

    const end = Date.now();
    console.log(`Rendered ${frameRenderCount} frames in ${end - start}ms`);

    encoder.finish();
    const buffer = encoder.out.getData();
    return buffer;
  }
}
