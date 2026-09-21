import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vitest/config";

import Vue from "@vitejs/plugin-vue";
import VueRouter from "unplugin-vue-router/vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import svgLoader from "vite-svg-loader";

export default defineConfig({
  plugins: [
    VueRouter({
      routesFolder: "src/pages",
    }),
    // Vue must be placed AFTER VueRouter()
    Vue(),
    AutoImport({
      include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/, /\.md$/],
      imports: ["pinia", "vue", "vue-router", "@vueuse/core"],
      vueTemplate: true,
      dts: true,
      eslintrc: {
        enabled: true,
        filepath: "./auto-import.json",
        globalsPropValue: true,
      },
      // importStyle: "sass" is load-bearing — the default "css" makes every SCSS theme override silently do nothing
      resolvers: [ElementPlusResolver({ importStyle: "sass" })],
    }),
    Components({
      dts: true,
      deep: true,
      directoryAsNamespace: true,
      collapseSamePrefixes: true,
      // importStyle: "sass" is load-bearing — the default "css" makes every SCSS theme override silently do nothing
      resolvers: [ElementPlusResolver({ importStyle: "sass" })],
    }),
    svgLoader(),
  ],
  test: {
    environment: "happy-dom",
    globals: false,
    include: ["src/**/*.spec.ts"],
    server: {
      deps: {
        inline: ["element-plus"],
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        additionalData: '@use "@/assets/element.scss" as *;',
      },
    },
  },
});
