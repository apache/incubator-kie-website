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
import React, { memo, useEffect, useState, type ReactNode } from "react";
import { useLocation } from "@docusaurus/router";
import { useThemeConfig } from "@docusaurus/theme-common";
import { groupBlogSidebarItemsByYear } from "@docusaurus/plugin-content-blog/client";
import type { Props } from "@theme/BlogSidebar/Content";
import type { BlogSidebarItem } from "@docusaurus/plugin-content-blog";

import styles from "./styles.module.css";

function BlogSidebarYearGroup({
  year,
  yearGroupHeadingClassName,
  shouldOpen,
  children,
}: {
  year: string;
  yearGroupHeadingClassName?: string;
  shouldOpen: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(shouldOpen);

  // The sidebar survives client-side navigation — these groups are keyed by
  // year, so they are not remounted — and initial state alone would leave the
  // active post hidden inside a year the reader had collapsed, or never opened.
  // This only ever opens: a group the reader collapsed by hand stays collapsed
  // until the current post actually moves into it.
  useEffect(() => {
    if (shouldOpen) {
      setOpen(true);
    }
  }, [shouldOpen]);
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
          shouldOpen={index === 0 || containsCurrentPost(yearItems)}
        >
          <ListComponent items={yearItems} />
        </BlogSidebarYearGroup>
      ))}
    </>
  );
}

export default memo(BlogSidebarContent);
