/** @jsxImportSource frog/jsx */
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import { Frog } from 'frog';
import { devtools } from 'frog/dev';
import { serveStatic } from 'frog/serve-static';
import { startProxy } from '../utils/proxy';
import { app as pokemon } from './pokemon';
import { Logger } from '../utils/Logger';

dotenv.config();

declare global {
  var cloudflared: string | undefined;
}

if (process.env.PROXY === 'true' && !globalThis.cloudflared) {
  const cloudflared = await startProxy();
  globalThis.cloudflared = cloudflared;
}

const origin =
  process.env.PROXY && globalThis.cloudflared !== undefined
    ? globalThis.cloudflared
    : process.env.NODE_ENV !== 'production'
      ? `http://localhost:${process.env.PORT}`
      : 'https://frameboy.xyz';

console.log({ origin });
const root = process.cwd();

async function getFonts() {
  const Minecraft = await readFile(`${root}/fonts/minecraft.ttf`);

  return [
    {
      name: 'minecraft',
      data: Minecraft,
      weight: 400,
    } as const,
  ];
}

const app = new Frog({
  assetsPath: '/',
  basePath: '/',
  origin,
  imageAspectRatio: '1:1',
  imageOptions: {
    fonts: await getFonts(),
  },
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
});

app.use(async (c, next) => {
  Logger.info(`[${c.req.method}] ${c.req.url}`);
  await next();
});

app.route('/pokemon', pokemon);

app.use('/*', serveStatic({ root: './public' }));
devtools(app, { serveStatic });

if (typeof Bun !== 'undefined') {
  const port = process.env.PORT || 3000;
  Bun.serve({
    fetch: app.fetch,
    port,
  });
  console.log(`Server is running on port ${port}`);
}

// app.hono.route("/stream", streamer);
