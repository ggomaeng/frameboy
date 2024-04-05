import { takeRight } from "lodash-es";
import { CHAT } from "../src/constants/pixeldata";

export function isChatScreen(screen: number[]) {
  const rows = 3;
  const lastrows = 160 * rows * 4;
  const taken = takeRight(screen, lastrows);
  return CHAT.every((v, i) => v === taken[i]);
}
