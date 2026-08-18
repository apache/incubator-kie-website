import Logo from "@theme/Logo";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useLocation } from "@docusaurus/router";

import styles from "./styles.module.css";

type Component = {
  /** Root path of the component's section, e.g. "/drools". */
  path: string;
  /** Component name, spelled out next to the Apache KIE mark. */
  title: string;
  /** Square component mark, served from static/img. */
  logo: string;
};

const COMPONENTS: Component[] = [
  { path: "/drools", title: "Drools", logo: "/img/drools.svg" },
  { path: "/optaplanner", title: "OptaPlanner", logo: "/img/planner.svg" },
  { path: "/jbpm", title: "jBPM", logo: "/img/jbpm.svg" },
  { path: "/kogito", title: "Kogito", logo: "/img/kogito.svg" },
  { path: "/sonataflow", title: "SonataFlow", logo: "/img/sonataflow.svg" },
  { path: "/tools", title: "Tools", logo: "/img/tools.svg" },
];

function findComponent(pathname: string): Component | undefined {
  const current = pathname.replace(/\/+$/, "");
  return COMPONENTS.find(
    (component) =>
      current === component.path || current.startsWith(`${component.path}/`)
  );
}

/**
 * Swizzled to append a component lockup to the Apache KIE logo while browsing
 * a component section, so the navbar reads "Apache KIE / Drools". Every other
 * page renders the stock logo.
 */
export default function NavbarLogo(): JSX.Element {
  const { pathname } = useLocation();
  const component = findComponent(pathname);
  const logoUrl = useBaseUrl(component?.logo ?? "/img/favicon.ico");

  const kieLogo = (
    <Logo
      className="navbar__brand"
      imageClassName="navbar__logo"
      titleClassName="navbar__title text--truncate"
    />
  );

  if (!component) {
    return kieLogo;
  }

  return (
    <div className={styles.lockup}>
      {kieLogo}
      <span className={styles.separator} aria-hidden="true">
        /
      </span>
      <Link to={component.path} className={styles.componentBrand}>
        <img
          className={styles.componentLogo}
          src={logoUrl}
          alt=""
          aria-hidden="true"
        />
        <span className={styles.componentTitle}>{component.title}</span>
      </Link>
    </div>
  );
}
