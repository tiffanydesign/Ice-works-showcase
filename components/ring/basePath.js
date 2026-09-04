// Public assets live under the deployment base path. Inlined at build time by
// Next from next.config.mjs, so it is a literal string in the bundle.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefixes a /public path with the deployment base path. */
export const asset = (path) => `${BASE_PATH}/${path.replace(/^\//, "")}`;
