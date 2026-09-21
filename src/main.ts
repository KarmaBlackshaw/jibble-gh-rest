import "@/assets/style.scss";

import { VueQueryPlugin } from "@tanstack/vue-query";

import pinia from "@/pinia";
import router from "@/router";
import { queryClientConfig } from "@/vueQuery";

import App from "./App.vue";

const app = createApp(App).use(pinia).use(router).use(VueQueryPlugin, { queryClientConfig });

router.isReady().then(() => app.mount("#app"));
