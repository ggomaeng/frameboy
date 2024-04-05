const GameBoy = require("../../serverboy");
import { readFileSync } from "fs";
import ServerBoy from "../../types/serverboy";
import { CHAT, CREDIT, EMPTY_FRAME_160_144 } from "../constants/pixeldata";
import GIFEncoder from "gifencoder";

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
    let saveState = readFileSync(`${rootDir}/states/skipped-intro.json`);
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

  public async generateGif(
    fid: number,
    keyPress: keyof typeof ServerBoy.KEYMAP
  ) {
    const gameboy = this.getGameboy(fid);
    const start = Date.now();

    const wasMove =
      keyPress === "RIGHT" ||
      keyPress === "LEFT" ||
      keyPress === "UP" ||
      keyPress === "DOWN";

    // Create a GIFEncoder instance.
    const encoder = new GIFEncoder(160, 160); // Change the dimensions as needed.
    encoder.start(); // order is important
    // encoder.setDelay(1000 / 30); // 30 FPS
    encoder.setQuality(10);
    // for chat don't repeat
    encoder.setRepeat(wasMove ? 0 : -1);

    const CHAT_SIZE = CHAT.length;
    const LONGER_FRAME_COUNT = 50;
    let frameRenderCount = wasMove ? 5 : 10;
    let isChat = true;
    for (let i = 0; i < frameRenderCount; i++) {
      gameboy.doFrame();
      const screen = gameboy.getScreen();
      const rgbaArray: number[] = structuredClone(EMPTY_FRAME_160_144);
      let j = 0;
      for (let i = 0; i < screen.length; i++) {
        rgbaArray[i] = screen[i];

        if (i > screen.length - CHAT_SIZE && CHAT[++j] !== screen[i]) {
          isChat = false;
        }
      }

      // render longer frames if not chat & move is not pressed
      if (!isChat && !wasMove && frameRenderCount < LONGER_FRAME_COUNT) {
        console.log("incrase framerender");
        frameRenderCount = LONGER_FRAME_COUNT;
      }
      rgbaArray.push(...CREDIT);
      const img = Buffer.from(rgbaArray);

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
