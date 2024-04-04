/** @jsxImportSource frog/jsx */
import dotenv from "dotenv";
import { Frog } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
import { startProxy } from "../utils/proxy";
import { app as pokemon } from "./pokemon";

dotenv.config();

declare global {
  var cloudflared: string | undefined;
}

if (process.env.PROXY === "true" && !globalThis.cloudflared) {
  const cloudflared = await startProxy();
  globalThis.cloudflared = cloudflared;
}

const origin =
  process.env.PROXY && globalThis.cloudflared !== undefined
    ? globalThis.cloudflared
    : process.env.NODE_ENV === "development"
    ? `http://localhost:${process.env.PORT}`
    : undefined;

console.log({ origin });

const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  origin,
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
});

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

// app.frame("/", (c) => {
//   const { buttonValue, inputText, status } = c;
//   const fruit = inputText || buttonValue;
//   return c.res({
//     image: (
// <div tw='flex items-center justify-center'></div>
//     ),
//     intents: [
//       <TextInput placeholder="Enter custom fruit..." />,
//       <Button value="apples">Apples</Button>,
//       <Button value="oranges">Oranges</Button>,
//       <Button value="bananas">Bananas</Button>,
//       status === "response" && <Button.Reset>Reset</Button.Reset>,
//     ],
//   });
// });

app.route("/pokemon", pokemon);

app.use("/*", serveStatic({ root: "./public" }));
devtools(app, { serveStatic });

if (typeof Bun !== "undefined") {
  const port = process.env.PORT || 3000;
  Bun.serve({
    fetch: app.fetch,
    port,
  });
  console.log(`Server is running on port ${port}`);
}

// app.hono.route("/stream", streamer);
