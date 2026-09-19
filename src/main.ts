import "@/assets/style.scss";

import pinia from "@/pinia";
import router from "@/router";

import App from "./App.vue";

const app = createApp(App).use(pinia).use(router);

router.isReady().then(() => app.mount("#app"));
