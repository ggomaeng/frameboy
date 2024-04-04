/** @jsxImportSource frog/jsx */
import { Button, Frog, TextInput } from "frog";
import { neynar } from "frog/middlewares";
import { NEYNAR_API_KEY } from "../../env/server-env.js";
import { GbaManager } from "../emulator/GbaManager.js";
const origin =
  process.env.PROXY && globalThis.cloudflared !== undefined
    ? globalThis.cloudflared
    : process.env.NODE_ENV === "development"
    ? `http://localhost:${process.env.PORT}`
    : undefined;

const GBA = GbaManager.getInstance();

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
};

const neynarMiddleware = neynar({
  apiKey: NEYNAR_API_KEY,
  features: ["interactor"],
});

export const app = new Frog<{
  State: AppState;
}>({
  imageAspectRatio: "1:1",
  imageOptions: {
    width: 160,
    height: 160,
  },
  initialState: {
    started: false,
    mode: "menu",
  },
});

app.hono.get("/stream/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const gif = await GBA.generateGif(id);

  return new Response(gif, {
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
  console.log(buttonIndex);
  const user = c.var.interactor;
  const fid = user?.fid || 1;

  const state = deriveState((previousState) => {
    if (inputText === "t") {
      if (previousState.mode === "move") {
        previousState.mode = "menu";
      } else {
        previousState.mode = "move";
      }
    } else if (!previousState?.started) {
      GBA.startGame(fid, "pokemon-yellow.gbc");
      previousState.started = true;
    } else if (buttonIndex) {
      const gameboy = GBA.getGameboy(fid);
      let index = buttonIndex;
      if (previousState.mode === "menu") index += 4;
      const key = BUTTONS[index as keyof typeof BUTTONS];
      gameboy.pressKey(BUTTONS[index as keyof typeof BUTTONS]);
    }
  });

  return c.res({
    image: `${origin}/api/pokemon/stream/${fid}?t=${Date.now()}`,
    intents:
      state.mode === "move"
        ? [
            <TextInput placeholder={`Type t to toggle controls`} />,
            <Button>←</Button>,
            <Button>→</Button>,
            <Button>↑</Button>,
            <Button>↓</Button>,
          ]
        : [
            <TextInput placeholder={`Type t to toggle controls`} />,
            <Button>SEL</Button>,
            <Button>START</Button>,
            <Button>A</Button>,
            <Button>B</Button>,
          ],
  });
});
