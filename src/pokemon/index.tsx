/** @jsxImportSource frog/jsx */
import dotenv from "dotenv";
import { Button, Frog, TextInput } from "frog";
import { neynar } from "frog/middlewares";
import { writeFile, writeFileSync } from "fs";
import sharp from "sharp";
import { NEYNAR_API_KEY } from "../../env/server-env.js";
import { GbaManager } from "../emulator/GbaManager.js";
import ServerBoy from "../../types/serverboy";
import { isChatScreen } from "../../utils/pixels";

dotenv.config();

const rootDir = process.cwd();

const origin =
  process.env.PROXY && globalThis.cloudflared !== undefined
    ? globalThis.cloudflared
    : process.env.NODE_ENV !== "production"
    ? `http://localhost:${process.env.PORT}`
    : "https://frameboy.xyz";

console.log(origin);

const GBA = GbaManager.getInstance();
const GAME = "pokemon-yellow.gbc";

const BUTTONS = {
  1: "LEFT",
  2: "RIGHT",
  3: "UP",
  4: "DOWN",
  5: "SELECT",
  6: "START",
  7: "A",
  8: "B",
} as const;

type AppState = {
  started: boolean;
  mode: "move" | "menu";
  multiplier: number;
  lastKey: keyof typeof ServerBoy.KEYMAP;
};

const neynarMiddleware = neynar({
  apiKey: NEYNAR_API_KEY,
  features: ["interactor"],
});

export const app = new Frog<{
  State: AppState;
}>({
  imageAspectRatio: "1:1",
  initialState: {
    started: false,
    mode: "move",
    multiplier: 1,
    lastKey: "A",
  },
});

app.hono.get("/stream/:id/:key", async (c) => {
  const id = Number(c.req.param("id"));
  const key = c.req.param("key");
  const gif = await GBA.generateGif(id, key as keyof typeof ServerBoy.KEYMAP);
  const resized = await sharp(gif, { animated: true })
    .resize(160, 160)
    .toBuffer();

  return new Response(resized, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store",
    },
  });
});

app.frame("/", async (c) => {
  return c.res({
    image: "https://r2.easyimg.io/o7loqv80m/gbc_optimize.gif",
    intents: [<Button action="/play">Play FrameBoy 🎮</Button>],
  });
});

app.frame("/play", neynarMiddleware, async (c) => {
  const { deriveState, buttonIndex, inputText } = c;
  const user = c.var.interactor;
  const fid = user?.fid || 1;

  if (GBA.getTotalPlayers() >= 100) {
    return c.res({
      image: (
        <div tw="w-full h-full flex flex-col items-center justify-center text-white bg-black">
          <div tw="text-4xl">🎮</div>
          <div tw="text-2xl mt-5">
            There are too many players playing right now
          </div>
          <div tw="mt-5">Refresh to try again</div>
          <div tw="text-base mt-10 text-gray-500 flex">
            Current players: {GBA.getTotalPlayers().toString()}
          </div>
        </div>
      ),
      intents: [<Button>Refresh</Button>],
    });
  }

  const state = deriveState((previousState) => {
    const gameboy = GBA.getGameboy(fid);

    // debug
    if (inputText === "memory") {
      const memory = gameboy.save();
      // const memory = gameboy.getMemory();
      writeFileSync(`saved.json`, JSON.stringify(memory));
    } else if (inputText === "img") {
      const screen = gameboy.getScreen();
      writeFileSync(`screen.json`, JSON.stringify(screen));
    }

    if (inputText === "t") {
      if (previousState.mode === "move") {
        previousState.mode = "menu";
      } else {
        previousState.mode = "move";
      }
    } else if (!previousState?.started || !gameboy.initialized()) {
      GBA.startGame(fid, GAME);
      previousState.started = true;
    } else if (buttonIndex) {
      const gameboy = GBA.getGameboy(fid);

      const inputTextIsNum = inputText && /^\d+$/.test(inputText);
      if (inputTextIsNum && Number(inputText) >= 1) {
        previousState.multiplier = Number(inputText);
      }

      let index = buttonIndex;
      if (previousState.mode === "menu") index += 4;
      const key = BUTTONS[index as keyof typeof BUTTONS];
      for (let i = 0; i < previousState.multiplier; i++) {
        gameboy.pressKey(key);
        gameboy.doFrame();
      }

      GBA.updateActivity(fid);
      const screen = gameboy.getScreen();
      const isChat = isChatScreen(screen);
      if (isChat) {
        previousState.mode = "menu";
      }

      previousState.lastKey = key;

      // save state per user
      writeFile(
        `${rootDir}/saves/${GAME}/${fid}.json`,
        JSON.stringify(gameboy.save()),
        (err) => {
          if (err) {
            console.error(err);
          }
        }
      );
    }
  });

  const { multiplier, mode, lastKey } = state;
  const multiplierText = multiplier > 1 ? `${multiplier} x ` : "";

  return c.res({
    // image: <div tw="flex">hello</div>,
    image: `${origin}/pokemon/stream/${fid}/${lastKey}?t=${Date.now()}`,
    intents:
      mode === "menu"
        ? [
            <TextInput placeholder={"t(toggle)/number(key multiplier)"} />,
            <Button>SEL</Button>,
            <Button>START</Button>,
            <Button>{multiplierText}A</Button>,
            <Button>{multiplierText}B</Button>,
          ]
        : [
            <TextInput placeholder={"t(toggle)/number(key multiplier)"} />,
            <Button>{multiplierText}←</Button>,
            <Button>{multiplierText}→</Button>,
            <Button>{multiplierText}↑</Button>,
            <Button>{multiplierText}↓</Button>,
          ],
  });
});
