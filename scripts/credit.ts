import { readFileSync, writeFileSync } from "fs";
import sharp from "sharp";

const root = process.cwd();
const img = readFileSync(`${root}/public/credit.png`);
sharp(img)
  .resize(160, 16)
  .png()
  .ensureAlpha()
  .raw()
  .toBuffer()
  .then((data) => {
    writeFileSync(`${root}/public/credit.json`, JSON.stringify(data));
  });
