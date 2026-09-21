import { createRouter, createWebHistory, START_LOCATION } from "vue-router";
import type { RouteLocationNormalized, RouterScrollBehavior } from "vue-router";
import { routes, handleHotUpdate } from "vue-router/auto-routes";

let restoredScroll = false;

export const scrollBehavior: RouterScrollBehavior = (_to, _from, savedPosition) => {
  restoredScroll = savedPosition !== null;

  return savedPosition ?? { top: 0 };
};

export function focusPageHeadingOnPathChange(to: RouteLocationNormalized, from: RouteLocationNormalized): void {
  if (from === START_LOCATION || to.path === from.path) {
    return;
  }

  nextTick(() => {
    document.querySelector<HTMLElement>("h1")?.focus({ preventScroll: restoredScroll });
  });
}

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior,
});

router.afterEach(focusPageHeadingOnPathChange);

if (import.meta.hot?.data) {
  handleHotUpdate(router);
}

export default router;
