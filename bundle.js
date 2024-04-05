import lightningcss from "bun-lightningcss";

await Bun.build({
  entrypoints: ["./src/index.tsx"],
  outdir: "./dist",
  plugins: [lightningcss()],
});
