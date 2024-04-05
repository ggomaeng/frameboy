await Bun.build({
  entrypoints: ["./src/index.tsx"],
  outdir: "./build",
  target: "bun",
});
