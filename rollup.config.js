import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import replace from "@rollup/plugin-replace";
import minifyPrivatesTransformer from "ts-transformer-minify-privates";
import { readdirSync } from "node:fs";

// Собираем entry points из examples/*_content.ts
const exampleEntries = readdirSync("src/examples")
  .filter((f) => f.endsWith("_content.ts"))
  .map((f) => `src/examples/${f}`);

const plugins = [
  replace({
    "process.env.NODE_ENV": JSON.stringify("production"),
    preventAssignment: true,
  }),

  resolve({
    moduleSideEffects: false,
    preferBuiltins: false,
  }),

  commonjs(),

  typescript({
    tsconfig: "tsconfig.json",
    transformers: [
      (service) => ({
        before: [minifyPrivatesTransformer.default(service.getProgram())],
        after: [],
      }),
    ],
  }),

  terser({
    ecma: 2020,
    module: true,
    toplevel: true,

    compress: {
      passes: 8,
      drop_console: true,
      drop_debugger: true,
      pure_getters: true,
      unsafe: false, // можно включить, но риск
      unsafe_arrows: true,
      unsafe_methods: true,
      unsafe_symbols: true,

      hoist_funs: true,
      hoist_vars: false,

      booleans_as_integers: true,
      module: true,
    },

    mangle: {
      toplevel: true,
      properties: {
        regex: /^_/,
      },
    },

    format: {
      comments: false,
    },
  }),
];

export default [
  {
    input: "src/editor/src/main.ts",
    output: {
      file: "dist/editor/main.js",
      format: "es",
      sourcemap: false,
    },
    plugins,
  },

  {
    input: "src/editor/src/preview.ts",
    output: {
      file: "dist/editor/preview.js",
      format: "es",
      sourcemap: false,
    },
    plugins,
  },

  ...exampleEntries.map((input) => ({
    input,
    output: {
      file: input.replace("src/examples/", "dist/examples/").replace(".ts", ".js"),
      format: "es",
      sourcemap: false,
    },
    plugins,
  })),
];

// import resolve from "@rollup/plugin-node-resolve";
// import commonjs from "@rollup/plugin-commonjs";
// import typescript from "@rollup/plugin-typescript";
// import terser from "@rollup/plugin-terser";
// import replace from "@rollup/plugin-replace";
// import { readdirSync } from "node:fs";

// // Собираем entry points из examples/*_content.ts
// const exampleEntries = readdirSync("src/examples")
//   .filter((f) => f.endsWith("_content.ts"))
//   .map((f) => `src/examples/${f}`);

// // Общая конфигурация плагинов
// const plugins = [
//   replace({ "process.env.NODE_ENV": JSON.stringify("production"), preventAssignment: true }),
//   resolve({ moduleSideEffects: false }),
//   commonjs(),
//   typescript(),
//   terser(),
// ];

// export default [
//   // Editor — main UI
//   {
//     input: "src/editor/main.ts",
//     output: {
//       file: "dist/editor/main.js",
//       format: "es",
//     },
//     plugins,
//   },
//   // Editor — preview iframe
//   {
//     input: "src/editor/preview.ts",
//     output: {
//       file: "dist/editor/preview.js",
//       format: "es",
//     },
//     plugins,
//   },
//   // Examples — каждый *_content.ts отдельный entry point
//   ...exampleEntries.map((input) => ({
//     input,
//     output: {
//       file: input.replace("src/examples/", "dist/examples/").replace(".ts", ".js"),
//       format: "es",
//     },
//     plugins,
//   })),
// ];
