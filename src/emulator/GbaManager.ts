const GameBoyAdvance = require("../../gba");
import { writeFileSync, readFileSync } from "fs";
import GBA from "../../types/gba";
import gifencoder from "gifencoder";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { Writable } from "stream";
import { PNG } from "pngjs";
import GIFEncoder from "gifencoder";
import { EMPTY_FRAME } from "../constants/frame";
import { sleep } from "../../utils/time";

const rootDir = process.cwd();

export class GbaManager {
  private instancese: Record<number, GBA> = {};

  private static instance: GbaManager;

  private constructor() {
    // private to prevent direct construction calls with the `new` operator.
  }

  private createGameboy(fid: number) {
    if (this.instancese[fid]) {
      return this.instancese[fid];
    }
    const gba = new GameBoyAdvance() as GBA;
    const biosBuf = readFileSync(`${rootDir}/gba/resources/bios.bin`);
    console.log(biosBuf);
    gba.logLevel = gba.LOG_ERROR;
    gba.setBios(biosBuf);
    gba.setCanvasMemory();

    this.instancese[fid] = gba;

    return gba;
  }

  public getGameboy(fid: number) {
    if (!this.instancese[fid]) {
      // throw new Error(`Gameboy for ${fid} not found`);
      return this.createGameboy(fid);
    }
    return this.instancese[fid];
  }

  public static getInstance(): GbaManager {
    if (!GbaManager.instance) {
      GbaManager.instance = new GbaManager();
    }
    return GbaManager.instance;
  }

  public startGame(fid: number, game: string) {
    const gameboy = this.createGameboy(fid);
    const romPath = `${rootDir}/roms/nointro.gba`;
    gameboy.loadRomFromFile(romPath, function (err: any, result: any) {
      if (err) {
        console.error("loadRom failed:", err);
        process.exit(1);
      }
      console.log("loadRom result:", game);
      // gameboy.runStable();
    });
    return gameboy;
  }

  public async generateGif(fid: number) {
    const gameboy = this.getGameboy(fid);

    await sleep(100);

    const framesToRender = 4000;

    let tick = 0;
    const start = Date.now();
    console.log("starting");
    const encoder = new GIFEncoder(240, 240);
    encoder.setRepeat(0);
    encoder.setDelay(0);
    encoder.setQuality(10);
    encoder.start();
    const speedMultiplier = 10000;
    while (tick < framesToRender) {
      // gameboy.turbo(speedMultiplier);
      console.log("tick", tick);
      gameboy.step();
      const png = gameboy.screenshot();
      const rgbArray: number[] = structuredClone(EMPTY_FRAME);
      // start from 9600 pixels per row * 4 index to keep top offset
      png.data.forEach((byte, index) => {
        rgbArray[38400 + index] = byte;
      });

      const img = Buffer.from(rgbArray);
      const output = new PNG({
        width: 240,
        height: 240,
      });
      output.data = img;
      const file = PNG.sync.write(output);

      writeFileSync(`./gb.png`, file);
      encoder.addFrame(img as any);

      tick++;
    }
    const end = Date.now();
    encoder.finish();
    const buffer = encoder.out.getData();
    console.log(buffer);
    console.log("took", end - start, "ms to render", framesToRender);
    writeFileSync(`./gb.gif`, buffer);
    return buffer;
  }
}
