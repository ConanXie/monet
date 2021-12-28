import path from "path"
import typescript from "@rollup/plugin-typescript"
import { terser } from "rollup-plugin-terser"

/**
 * @type { import("rollup").RollupOptions }
 */
const config = {
  input: "src/index.ts",
  external: [
    "@monet-color/tools",
    "@monet-color/quantize",
    "@monet-color/palette",
    "@monet-color/theme",
  ],
  output: [
    {
      file: "dist/lib.cjs",
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "dist/lib.mjs",
      format: "esm",
      sourcemap: true,
    },
    {
      file: "dist/lib.min.js",
      format: "umd",
      name: process.env.UMD_NAME,
      plugins: [terser()],
      sourcemap: true,
    },
  ],
  plugins: [
    typescript({
      target: "es2019",
      baseUrl: "./src",
      tsconfig: path.resolve(__dirname, "./tsconfig.base.json"),
    }),
  ],
}

export default config
