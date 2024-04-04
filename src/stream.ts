import { stream } from "hono/streaming";
import { PassThrough } from "stream";
import { Hono } from "hono";
import { GbaManager } from "./emulator/GbaManager";
const gsockets = require("gifsockets");

export const streamer = new Hono();
streamer.get("/:id", async (c) => {
  const gifsocket = new gsockets({
    width: 240,
    height: 160,
  });

  const id = c.req.param("id");
  console.log("streamer", id);
  const pass = new PassThrough();
  const gameboy = GbaManager.getInstance().startGame(
    Math.floor(Math.random() * 1000),
    "pokemon-emerald"
  );
  await new Promise((resolve) => setTimeout(resolve, 100));

  gifsocket.addListener(pass, async function (err: any) {
    async function skipFrame() {
      await new Promise((resolve) => setTimeout(resolve, 1));
      gameboy.step();
      const png = gameboy.screenshot();
      const rgbaArray: number[] = [];
      png.data.forEach((byte, index) => {
        // Skip the alpha channel
        rgbaArray.push(byte);
      });

      // console.log(rgbPixels);
      gifsocket.writeRgbaFrame(rgbaArray);
      skipFrame();
    }
    skipFrame();
  });

  const readable = new ReadableStream({
    start(controller) {
      pass.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      pass.on("end", () => {
        controller.close();
      });
    },
  });

  c.res.headers.set("Content-Type", "image/gif");
  c.res.headers.set("Connection", "keep-alive");
  c.res.headers.set("Transfer-Encoding", "chunked");
  return stream(c, async (stream) => {
    // Write a process to be executed when aborted.
    stream.onAbort(() => {
      console.log("Aborted!");
    });
    await stream.pipe(readable);
  });
});
