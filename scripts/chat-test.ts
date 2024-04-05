import { PNG } from "pngjs";
import screen from "../screen.json";
import { writeFileSync } from "fs";
import { takeRight } from "lodash-es";

// console.log(screen.length);

// // trim credit
// for (let i = 0; i < 160 * 16 * 4; i++) {
//   screen.pop();
// }

const rows = 3;
const lastrows = 160 * rows * 4;
const row = takeRight(screen, lastrows);

writeFileSync(`./public/chat.json`, JSON.stringify(row));

const png = new PNG({
  width: 160,
  height: rows,
});
png.data = Buffer.from(row as any);
writeFileSync(`chat.png`, PNG.sync.write(png));
