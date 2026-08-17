/**
 * Swizzled from @docusaurus/theme-classic to make the year groups collapsible.
 *
 * Upstream renders each year as a plain `<div role="group">`, which is fine for
 * a handful of posts and unusable once the historical Drools/jBPM/OptaPlanner
 * archives are in — the sidebar becomes a single scroll of hundreds of titles.
 * Same grouping, wrapped in `<details>` so a reader can collapse a year.
 *
 * Open by default: the most recent year, plus whichever year contains the post
 * currently being read, so you never land on a page whose own entry is hidden.
 */
import React, { memo, useState, type ReactNode } from "react";
import { useLocation } from "@docusaurus/router";
import { useThemeConfig } from "@docusaurus/theme-common";
import { groupBlogSidebarItemsByYear } from "@docusaurus/plugin-content-blog/client";
import type { Props } from "@theme/BlogSidebar/Content";
import type { BlogSidebarItem } from "@docusaurus/plugin-content-blog";

import styles from "./styles.module.css";

function BlogSidebarYearGroup({
  year,
  yearGroupHeadingClassName,
  defaultOpen,
  children,
}: {
  year: string;
  yearGroupHeadingClassName?: string;
  defaultOpen: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <details
      className={styles.yearGroup}
      open={open}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
    >
      <summary className={styles.yearGroupSummary}>
        <span className={yearGroupHeadingClassName}>{year}</span>
      </summary>
      {children}
    </details>
  );
}

function BlogSidebarContent({
  items,
  yearGroupHeadingClassName,
  ListComponent,
}: Props): ReactNode {
  const themeConfig = useThemeConfig();
  const { pathname } = useLocation();

  if (!themeConfig.blog.sidebar.groupByYear) {
    return <ListComponent items={items} />;
  }

  const itemsByYear = groupBlogSidebarItemsByYear(items);
  const containsCurrentPost = (yearItems: BlogSidebarItem[]) =>
    yearItems.some((item) => item.permalink === pathname);

  return (
    <>
      {itemsByYear.map(([year, yearItems], index) => (
        <BlogSidebarYearGroup
          key={year}
          year={year}
          yearGroupHeadingClassName={yearGroupHeadingClassName}
          defaultOpen={index === 0 || containsCurrentPost(yearItems)}
        >
          <ListComponent items={yearItems} />
        </BlogSidebarYearGroup>
      ))}
    </>
  );
}

export default memo(BlogSidebarContent);
