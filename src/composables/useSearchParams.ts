import {
  REPO_SEARCH_SORT_FIELDS,
  REPO_SEARCH_SORT_DIRS,
  SEARCH_PER_PAGE,
  SEARCH_RESULT_CAP,
  type RepoSearchSort,
  type RepoSearchSortField,
  type RepoSearchSortDir,
} from "@/services/github/client";

const MAX_PAGE = Math.ceil(SEARCH_RESULT_CAP / SEARCH_PER_PAGE);

const isSortField = (value: string): value is RepoSearchSortField => REPO_SEARCH_SORT_FIELDS.some((field) => field === value);
const isSortDir = (value: string): value is RepoSearchSortDir => REPO_SEARCH_SORT_DIRS.some((dir) => dir === value);

function normalizeQuery(raw: string): string {
  return raw.trim().slice(0, 256).trimEnd();
}

function sortEqual(a: RepoSearchSort | null, b: RepoSearchSort | null): boolean {
  if (a === null || b === null) {
    return a === b;
  }

  return a.field === b.field && a.dir === b.dir;
}

export function useSearchParams() {
  const route = useRoute();
  const router = useRouter();

  const q = computed(() => {
    const raw = route.query.q;

    if (typeof raw !== "string") {
      return "";
    }

    return normalizeQuery(raw);
  });

  const sort = computed(() => {
    const raw = route.query.sort;

    if (typeof raw !== "string") {
      return null;
    }

    const parts = raw.split(":");

    if (parts.length !== 2) {
      return null;
    }

    const [field, dir] = parts;

    if (field !== undefined && dir !== undefined && isSortField(field) && isSortDir(dir)) {
      return { field, dir };
    }

    return null;
  });

  const page = computed(() => {
    const raw = route.query.page;
    const value = typeof raw === "string" ? Number(raw) : Number.NaN;
    const clean = Number.isInteger(value) && value >= 1 ? value : 1;

    return Math.min(clean, MAX_PAGE);
  });

  function ownedFor(qStr: string, sortVal: RepoSearchSort | null, pageNum: number) {
    return {
      q: qStr === "" ? undefined : qStr,
      sort: sortVal === null ? undefined : `${sortVal.field}:${sortVal.dir}`,
      page: pageNum <= 1 ? undefined : String(pageNum),
    };
  }

  function buildTarget(qStr: string, sortVal: RepoSearchSort | null, pageNum: number) {
    const owned = ownedFor(qStr, sortVal, pageNum);
    const target = { ...route.query };

    for (const key of ["q", "sort", "page"] as const) {
      const value = owned[key];

      if (value === undefined) {
        delete target[key];
      } else {
        target[key] = value;
      }
    }

    return target;
  }

  watch(
    () => route.query,
    () => {
      const owned = ownedFor(q.value, sort.value, page.value);

      const needsCorrection = (["q", "sort", "page"] as const).some((key) => {
        const current = route.query[key];
        const desired = owned[key];

        if (desired === undefined) {
          return current !== undefined;
        }

        return current !== desired;
      });

      if (!needsCorrection) {
        return;
      }

      void router.replace({ query: buildTarget(q.value, sort.value, page.value) });
    },
    { immediate: true }
  );

  async function submit(next: { q: string; sort: RepoSearchSort | null }): Promise<boolean> {
    const nextQuery = normalizeQuery(next.q);

    if (nextQuery === q.value && sortEqual(next.sort, sort.value) && page.value === 1) {
      return false;
    }

    await router.push({ path: "/", query: buildTarget(nextQuery, next.sort, 1) });

    return true;
  }

  async function goToPage(nextPage: number): Promise<boolean> {
    if (nextPage === page.value) {
      return false;
    }

    await router.push({ path: "/", query: buildTarget(q.value, sort.value, nextPage) });

    return true;
  }

  function clampPageTo(totalCount: number): void {
    const capped = Math.min(totalCount, SEARCH_RESULT_CAP);
    const lastPage = Math.max(1, Math.ceil(capped / SEARCH_PER_PAGE));

    if (page.value > lastPage) {
      void router.replace({ query: buildTarget(q.value, sort.value, lastPage) });
    }
  }

  return { q, sort, page, submit, goToPage, clampPageTo };
}
