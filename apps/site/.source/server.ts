// @ts-nocheck
import * as __fd_glob_19 from "../src/content/docs/plugin-api/with-plugins.mdx?collection=docs"
import * as __fd_glob_18 from "../src/content/docs/plugin-api/define-plugin.mdx?collection=docs"
import * as __fd_glob_17 from "../src/content/docs/official-plugins/router.mdx?collection=docs"
import * as __fd_glob_16 from "../src/content/docs/official-plugins/lucide.mdx?collection=docs"
import * as __fd_glob_15 from "../src/content/docs/core-api/dom-object.mdx?collection=docs"
import * as __fd_glob_14 from "../src/content/docs/core-api/create-root.mdx?collection=docs"
import * as __fd_glob_13 from "../src/content/docs/core-api/create-ref.mdx?collection=docs"
import * as __fd_glob_12 from "../src/content/docs/core-api/create-fragment.mdx?collection=docs"
import * as __fd_glob_11 from "../src/content/docs/core-api/create-element.mdx?collection=docs"
import * as __fd_glob_10 from "../src/content/docs/core-api/create-el-from-html-string.mdx?collection=docs"
import * as __fd_glob_9 from "../src/content/docs/typescript.mdx?collection=docs"
import * as __fd_glob_8 from "../src/content/docs/jd-config.mdx?collection=docs"
import * as __fd_glob_7 from "../src/content/docs/installation.mdx?collection=docs"
import * as __fd_glob_6 from "../src/content/docs/index.mdx?collection=docs"
import * as __fd_glob_5 from "../src/content/docs/getting-started.mdx?collection=docs"
import * as __fd_glob_4 from "../src/content/docs/create-a-plugin.mdx?collection=docs"
import { default as __fd_glob_3 } from "../src/content/docs/official-plugins/meta.json?collection=docs"
import { default as __fd_glob_2 } from "../src/content/docs/plugin-api/meta.json?collection=docs"
import { default as __fd_glob_1 } from "../src/content/docs/core-api/meta.json?collection=docs"
import { default as __fd_glob_0 } from "../src/content/docs/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "src/content/docs", {"meta.json": __fd_glob_0, "core-api/meta.json": __fd_glob_1, "plugin-api/meta.json": __fd_glob_2, "official-plugins/meta.json": __fd_glob_3, }, {"create-a-plugin.mdx": __fd_glob_4, "getting-started.mdx": __fd_glob_5, "index.mdx": __fd_glob_6, "installation.mdx": __fd_glob_7, "jd-config.mdx": __fd_glob_8, "typescript.mdx": __fd_glob_9, "core-api/create-el-from-html-string.mdx": __fd_glob_10, "core-api/create-element.mdx": __fd_glob_11, "core-api/create-fragment.mdx": __fd_glob_12, "core-api/create-ref.mdx": __fd_glob_13, "core-api/create-root.mdx": __fd_glob_14, "core-api/dom-object.mdx": __fd_glob_15, "official-plugins/lucide.mdx": __fd_glob_16, "official-plugins/router.mdx": __fd_glob_17, "plugin-api/define-plugin.mdx": __fd_glob_18, "plugin-api/with-plugins.mdx": __fd_glob_19, });