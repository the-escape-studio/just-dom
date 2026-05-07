// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"create-a-plugin.mdx": () => import("../src/content/docs/create-a-plugin.mdx?collection=docs"), "getting-started.mdx": () => import("../src/content/docs/getting-started.mdx?collection=docs"), "index.mdx": () => import("../src/content/docs/index.mdx?collection=docs"), "installation.mdx": () => import("../src/content/docs/installation.mdx?collection=docs"), "jd-config.mdx": () => import("../src/content/docs/jd-config.mdx?collection=docs"), "typescript.mdx": () => import("../src/content/docs/typescript.mdx?collection=docs"), "core-api/create-el-from-html-string.mdx": () => import("../src/content/docs/core-api/create-el-from-html-string.mdx?collection=docs"), "core-api/create-element.mdx": () => import("../src/content/docs/core-api/create-element.mdx?collection=docs"), "core-api/create-fragment.mdx": () => import("../src/content/docs/core-api/create-fragment.mdx?collection=docs"), "core-api/create-ref.mdx": () => import("../src/content/docs/core-api/create-ref.mdx?collection=docs"), "core-api/create-root.mdx": () => import("../src/content/docs/core-api/create-root.mdx?collection=docs"), "core-api/dom-object.mdx": () => import("../src/content/docs/core-api/dom-object.mdx?collection=docs"), "official-plugins/lucide.mdx": () => import("../src/content/docs/official-plugins/lucide.mdx?collection=docs"), "official-plugins/router.mdx": () => import("../src/content/docs/official-plugins/router.mdx?collection=docs"), "official-plugins/signals.mdx": () => import("../src/content/docs/official-plugins/signals.mdx?collection=docs"), "plugin-api/define-plugin.mdx": () => import("../src/content/docs/plugin-api/define-plugin.mdx?collection=docs"), "plugin-api/with-plugins.mdx": () => import("../src/content/docs/plugin-api/with-plugins.mdx?collection=docs"), }),
};
export default browserCollections;