import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import replace from "@rollup/plugin-replace";
import minifyPrivatesTransformer from "ts-transformer-minify-privates";
import { readdirSync } from "node:fs";

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

  // terser({
  //   ecma: 2020,
  //   module: true,
  //   toplevel: true,

  //   compress: {
  //     passes: 8,
  //     drop_console: true,
  //     drop_debugger: true,
  //     pure_getters: true,
  //     unsafe: false,
  //     unsafe_arrows: true,
  //     unsafe_methods: true,
  //     unsafe_symbols: true,

  //     hoist_funs: true,
  //     hoist_vars: false,

  //     booleans_as_integers: true,
  //     module: true,
  //   },

  //   mangle: {
  //     toplevel: true,
  //     properties: {
  //       regex: /^_/,
  //     },
  //   },

  //   format: {
  //     comments: false,
  //   },
  // }),
];

export default [
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "es",
      sourcemap: false,
    },
    plugins,
  },
  {
    input: "src/src/preview/preview.ts",
    output: {
      file: "dist/preview.js",
      format: "es",
      sourcemap: false,
    },
    plugins,
  },
];
