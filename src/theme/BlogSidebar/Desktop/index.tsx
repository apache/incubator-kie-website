/**
 * Swizzled from @docusaurus/theme-classic to make the sidebar title a link
 * back to the blog index.
 *
 * Upstream renders the title as a plain div. Once the year groups are
 * collapsible you can end up several years deep with no obvious way back to
 * the full list, so the heading itself becomes that way back.
 */
import React, { memo, type ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import { translate } from "@docusaurus/Translate";
import {
  useVisibleBlogSidebarItems,
  BlogSidebarItemList,
} from "@docusaurus/plugin-content-blog/client";
import BlogSidebarContent from "@theme/BlogSidebar/Content";
import type { Props } from "@theme/BlogSidebar/Desktop";

import styles from "./styles.module.css";

const ListComponent = ({ items }: { items: Props["sidebar"]["items"] }) => (
  <BlogSidebarItemList
    items={items}
    ulClassName={clsx(styles.sidebarItemList, "clean-list")}
    liClassName={styles.sidebarItem}
    linkClassName={styles.sidebarItemLink}
    linkActiveClassName={styles.sidebarItemLinkActive}
  />
);

function BlogSidebarDesktop({ sidebar }: Props): ReactNode {
  const items = useVisibleBlogSidebarItems(sidebar.items);
  return (
    <aside className="col col--3">
      <nav
        className={clsx(styles.sidebar, "thin-scrollbar")}
        aria-label={translate({
          id: "theme.blog.sidebar.navAriaLabel",
          message: "Blog recent posts navigation",
          description: "The ARIA label for recent posts in the blog sidebar",
        })}
      >
        <div className={styles.sidebarItemTitle}>
          <Link to="/blog" className={styles.sidebarTitleLink}>
            {sidebar.title}
          </Link>
        </div>
        <Link to="/blog/tags" className={styles.sidebarTagsLink}>
          {translate({
            id: "theme.blog.sidebar.browseTagsLabel",
            message: "Browse by tag",
            description: "The blog sidebar link to the tags index page",
          })}
        </Link>
        <BlogSidebarContent
          items={items}
          ListComponent={ListComponent}
          yearGroupHeadingClassName={styles.yearGroupHeading}
        />
      </nav>
    </aside>
  );
}

export default memo(BlogSidebarDesktop);
