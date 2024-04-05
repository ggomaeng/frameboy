const GameBoy = require('../../serverboy');
import { readFileSync } from 'fs';
import ServerBoy from '../../types/serverboy';
import { CHAT, CREDIT, EMPTY_FRAME_160_144 } from '../constants/pixeldata';
import GIFEncoder from 'gifencoder';

declare global {
  var gbaManager: GbaManager;
}

const rootDir = process.cwd();

export class GbaManager {
  private instances: Record<
    number,
    {
      gameboy: ServerBoy;
      lastActivityAt: number;
    }
  > = {};

  private static instance: GbaManager;

  public static getInstance(): GbaManager {
    if (globalThis.gbaManager) {
      return globalThis.gbaManager;
    }
    if (!GbaManager.instance) {
      GbaManager.instance = new GbaManager();
      globalThis.gbaManager = GbaManager.instance;
      return GbaManager.instance;
    }

    return GbaManager.instance;
  }

  private constructor() {
    console.log('GbaManager created - running ticks');
    setInterval(this.cleanupInactiveInstances.bind(this), 1000 * 60 * 10); // check every 10 minutes
  }

  private cleanupInactiveInstances() {
    console.log('Cleaning up inactive instances');
    const now = Date.now();
    for (const fid in this.instances) {
      const instance = this.instances[fid];
      if (now - instance.lastActivityAt > 1000 * 60 * 10) {
        instance.gameboy.cleanup();
        delete this.instances[fid];
      }
    }
  }

  public getTotalPlayers() {
    return Object.keys(this.instances).length;
  }

  public updateActivity(fid: number) {
    console.log('Updating activity', fid);
    this.instances[fid].lastActivityAt = Date.now();
  }

  public getGameboy(fid: number) {
    if (this.instances[fid]) {
      return this.instances[fid].gameboy;
    }

    const gameboy: ServerBoy = new GameBoy();

    this.instances[fid] = {
      gameboy,
      lastActivityAt: Date.now(),
    };
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

  public async generateGif(
    fid: number,
    keyPress: keyof typeof ServerBoy.KEYMAP,
  ) {
    const gameboy = this.getGameboy(fid);
    const start = Date.now();

    const wasMove =
      keyPress === 'RIGHT' ||
      keyPress === 'LEFT' ||
      keyPress === 'UP' ||
      keyPress === 'DOWN';

    // Create a GIFEncoder instance.
    const encoder = new GIFEncoder(160, 160); // Change the dimensions as needed.
    encoder.start(); // order is important
    encoder.setDelay(1000 / 15); // 30 FPS
    encoder.setQuality(10);
    // for chat don't repeat

    const CHAT_SIZE = CHAT.length;
    const FAST_SPEED = 200;
    const DEFAULT_SPEED = 35;
    let frameRenderCount = 5;

    if (!wasMove) {
      gameboy.setSpeed(FAST_SPEED);
      encoder.setRepeat(-1);
    } else {
      frameRenderCount = 3;
      gameboy.setSpeed(DEFAULT_SPEED);
      encoder.setRepeat(-1);
    }

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

      if (isChat || !wasMove) {
        gameboy.setSpeed(FAST_SPEED);
        encoder.setRepeat(-1);
      }
      rgbaArray.push(...CREDIT);
      const img = Buffer.from(rgbaArray);
      encoder.addFrame(img as any);
    }

    const end = Date.now();
    console.log(`Rendered ${frameRenderCount} frames in ${end - start}ms`);

    encoder.finish();
    const buffer = encoder.out.getData();
    return buffer;
  }
}
