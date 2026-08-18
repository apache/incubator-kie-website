/**
 * The component hotsites: Drools, jBPM and friends, each of which owns a
 * top-level docs section.
 *
 * One list, because several places need the same facts about a section and
 * they must not drift: the breadcrumbs need its name to sit between Home and
 * the page, and every page under it flies the component's logo as the
 * favicon.
 */
export type ComponentSection = {
  /** Sidebar name in sidebars.ts. */
  sidebar: string;
  /** The component's name, as a reader would say it. */
  label: string;
  /** The section's landing page, and the prefix every page under it shares. */
  basePath: string;
  /** The component's logo, used as the favicon across the section. */
  logo: string;
};

export const COMPONENT_SECTIONS: ComponentSection[] = [
  {
    sidebar: "droolsSidebar",
    label: "Drools",
    basePath: "/drools/",
    logo: "/img/drools.svg",
  },
  {
    sidebar: "optaplannerSidebar",
    label: "OptaPlanner",
    basePath: "/optaplanner/",
    logo: "/img/planner.svg",
  },
  {
    sidebar: "jbpmSidebar",
    label: "jBPM",
    basePath: "/jbpm/",
    logo: "/img/jbpm.svg",
  },
  {
    sidebar: "kogitoSidebar",
    label: "Kogito",
    basePath: "/kogito/",
    logo: "/img/kogito.svg",
  },
  {
    sidebar: "sonataflowSidebar",
    label: "SonataFlow",
    basePath: "/sonataflow/",
    logo: "/img/sonataflow.svg",
  },
  {
    sidebar: "toolsSidebar",
    label: "Tools",
    basePath: "/tools/",
    logo: "/img/tools.svg",
  },
];

export function findSectionBySidebar(
  sidebarName: string | undefined,
): ComponentSection | undefined {
  return COMPONENT_SECTIONS.find((s) => s.sidebar === sidebarName);
}

/**
 * The section a page belongs to. Matches the landing page itself (with or
 * without its trailing slash) and everything beneath it.
 */
export function findSectionByPath(
  pathname: string,
): ComponentSection | undefined {
  return COMPONENT_SECTIONS.find(
    (s) =>
      pathname === s.basePath ||
      pathname === s.basePath.replace(/\/$/, "") ||
      pathname.startsWith(s.basePath),
  );
}
