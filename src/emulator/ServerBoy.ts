const GameBoy = require("../../serverboy");
import { createWriteStream, readFileSync, writeFileSync } from "fs";
import { EMPTY_FRAME_160_144 } from "../constants/frame";
import { PNG } from "pngjs";
import GIFEncoder from "gifencoder";
import ServerBoy from "../../types/serverboy";
import { sleep } from "bun";

const root = process.cwd();
const rom = readFileSync(`${root}/roms/yellow.gbc`);

const gameboy: ServerBoy = new GameBoy();
// gameboy.loadRom(rom);
const saveBuffer = readFileSync(`./loading-ended.json`);
const parsed = JSON.parse(saveBuffer.toString());
gameboy.load(rom, parsed);

gameboy.pressKey("A");

const frameRenderCount = 300;
const start = Date.now();

// Create a GIFEncoder instance.
// const encoder = new GIFEncoder(160, 160); // Change the dimensions as needed.
// encoder.setDelay(1000 / 60); // 60 FPS
// encoder.setQuality(10);
// encoder.setRepeat(0);

// const output = createWriteStream("./gbc.gif");
// encoder.createReadStream().pipe(output);
// encoder.start();

for (let i = 0; i < frameRenderCount; i++) {
  console.log("tick", i);
  // if (i === 100) {
  //   gameboy.pause();
  // }
  gameboy.doFrame();
  const screen = gameboy.getScreen();
  const rgbaArray: number[] = structuredClone(EMPTY_FRAME_160_144);
  const top8Rows = 160 * 8 * 4;
  for (let i = 0; i < screen.length; i++) {
    rgbaArray[top8Rows + i] = screen[i];
  }
  const png = new PNG({
    width: 160,
    height: 160,
  });
  const img = Buffer.from(rgbaArray);
  png.data = img;
  // encoder.addFrame(img as any);
  writeFileSync(`gbc.png`, PNG.sync.write(png));
}

gameboy.pause();
await sleep(1000);
const memory = gameboy.save();
// const memory = gameboy.getMemory();
writeFileSync(`gbc_memory.json`, JSON.stringify(memory));

const end = Date.now();
console.log(`Rendered ${frameRenderCount} frames in ${end - start}ms`);

// encoder.finish();
// const buffer = encoder.out.getData();
// writeFileSync(`gbc.gif`, buffer);
