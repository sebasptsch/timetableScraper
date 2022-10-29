import { defineConfig } from "tsup";

export default defineConfig({
  entryPoints: ["src/index.ts"],
  format: ["esm", "cjs"],
  splitting: true,
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  target: "ESNext",
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
