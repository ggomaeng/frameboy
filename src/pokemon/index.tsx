/** @jsxImportSource frog/jsx */
import { Button, Frog } from "frog";
import { NeynarVariables, neynar } from "frog/middlewares";
import { NEYNAR_API_KEY } from "../../env/server-env.js";
import { GbaManager } from "../emulator/GbaManager.js";
import { sleep } from "bun";

const GBA = GbaManager.getInstance();

type AppState = {
  started: boolean;
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
    width: 100,
    height: 100,
  },
  initialState: {
    started: false,
  },
});

app.hono.get("/test", async (c) => {
  const id = Math.floor(Math.random() * 1000);
  GBA.startGame(id, "pokemon-emerald");
  await sleep(100);
  GBA.generateGif(id);

  return c.html("hello");
});

app.hono.get("/stream/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const gif = await GBA.generateGif(id);

  return new Response(gif, {
    headers: { "Content-Type": "image/gif" },
  });
});

app.frame("/", async (c) => {
  return c.res({
    image: "https://i.imgur.com/pWLifDi.gif",
    intents: [<Button action="/start">Start</Button>],
  });
});

app.frame("/start", neynarMiddleware, async (c) => {
  const { deriveState } = c;
  const user = c.var.interactor;
  const fid = user?.fid || 1;

  deriveState((previousState) => {
    if (!previousState?.started) {
      GBA.startGame(fid, "pokemon-emerald");
      previousState.started = true;
    }
  });

  return c.res({
    image: `http://localhost:3000/api/pokemon/stream/${fid}`,
    intents: [<Button>Testing</Button>],
  });
});
