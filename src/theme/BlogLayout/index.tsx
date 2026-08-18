/**
 * Swizzled from @docusaurus/theme-classic to give the blog a persistent
 * right-hand rail.
 *
 * Upstream only renders the right column when a `toc` is passed, which the
 * post pages do and the list page doesn't — so `/blog` had a two-column gap on
 * the right and nowhere to put the link to the tag index. This renders the
 * column unconditionally: the tags link on top, the table of contents under it
 * where there is one.
 *
 * The column widths are unchanged from upstream; the rail fills space the grid
 * was already reserving.
 */
import React, { type ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import { useLocation } from "@docusaurus/router";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { translate } from "@docusaurus/Translate";
import Layout from "@theme/Layout";
import BlogSidebar from "@theme/BlogSidebar";
import type { Props } from "@theme/BlogLayout";

import styles from "./styles.module.css";

function BlogTagsLink() {
  const tagsPath = useBaseUrl("/blog/tags");
  const { pathname } = useLocation();

  // Don't offer the link on the tag index itself, nor on an individual tag
  // page below it, where it points back at where you already are. Prefix
  // match, so /blog/tags and /blog/tags/<tag> are both covered; the trailing
  // slash is normalised away because `trailingSlash` is a site-level setting
  // this component shouldn't care about.
  const normalize = (p: string) => p.replace(/\/$/, "");
  if (
    normalize(pathname) === normalize(tagsPath) ||
    normalize(pathname).startsWith(`${normalize(tagsPath)}/`)
  ) {
    return null;
  }

  // `to` stays site-relative: @docusaurus/Link applies baseUrl itself (via
  // withBaseUrl), so passing the already-resolved `tagsPath` here would risk
  // prefixing it twice. `tagsPath` is only for comparing against `pathname`,
  // which is baseUrl-inclusive.
  return (
    <Link to="/blog/tags" className={styles.tagsLink}>
      {translate({
        id: "theme.blog.sidebar.browseTagsLabel",
        message: "Browse by tag",
        description: "The blog sidebar link to the tags index page",
      })}
    </Link>
  );
}

export default function BlogLayout(props: Props): ReactNode {
  const { sidebar, toc, children, ...layoutProps } = props;
  const hasSidebar = sidebar && sidebar.items.length > 0;

  return (
    <Layout {...layoutProps}>
      <div className="container margin-vert--lg">
        <div className="row">
          <BlogSidebar sidebar={sidebar} />
          <main
            className={clsx("col", {
              "col--7": hasSidebar,
              "col--9 col--offset-1": !hasSidebar,
            })}
          >
            {children}
          </main>
          <div className="col col--2">
            <div className={styles.rail}>
              <BlogTagsLink />
            </div>
            {toc}
          </div>
        </div>
      </div>
    </Layout>
  );
}
