// 240x240 pixel of 0,0,0 rgb numbers
export const EMPTY_FRAME: number[] = new Array(240 * 240)
  .fill([0, 0, 0, 255])
  .flat();

export const EMPTY_FRAME_160_144: number[] = new Array(160 * 144)
  .fill([0, 0, 0, 255])
  .flat();

const root = process.cwd();
const json = require(`${root}/public/credit.json`);
console.log(json.data.length);
export const CREDIT = json.data;

const chatJson = require(`${root}/public/chat.json`);
export const CHAT: number[] = chatJson;
