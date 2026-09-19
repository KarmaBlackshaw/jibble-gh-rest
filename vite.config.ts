import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";

import Vue from "@vitejs/plugin-vue";
import VueRouter from "unplugin-vue-router/vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import svgLoader from "vite-svg-loader";

export default defineConfig({
  plugins: [
    VueRouter({
      routesFolder: "src/pages",
    }),
    // Vue must be placed AFTER VueRouter()
    Vue(),
    AutoImport({
      dirs: ["./src/composables", "./src/utils", "./src/stores", "./src/services/**/*.ts"],
      include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/, /\.md$/],
      imports: ["pinia", "vue", "vue-router", "@vueuse/core"],
      vueTemplate: true,
      dts: true,
      eslintrc: {
        enabled: true,
        filepath: "./auto-import.json",
        globalsPropValue: true,
      },
    }),
    Components({
      dts: true,
      deep: true,
      directoryAsNamespace: true,
      collapseSamePrefixes: true,
    }),
    svgLoader(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
