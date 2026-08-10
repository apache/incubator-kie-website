import Head from "@docusaurus/Head";
import { useLocation } from "@docusaurus/router";
import useBaseUrl from "@docusaurus/useBaseUrl";

import { findSectionByPath } from "@site/src/componentSections";

const SITE_FAVICON = "/img/favicon.ico";

/**
 * Flies the component's own logo as the favicon on every page of a component
 * hotsite, so a tab parked on the Drools docs is recognisable as Drools, and
 * the site's own icon everywhere else.
 *
 * The favicon is set here rather than by `favicon` in docusaurus.config.ts.
 * With both, two `rel="icon"` links are emitted and the browser honours the
 * last one — which was the config's, so the component logo never won.
 */
function Favicon(): JSX.Element {
  const { pathname } = useLocation();
  const section = findSectionByPath(pathname);
  const icon = section?.logo ?? SITE_FAVICON;
  const href = useBaseUrl(icon);

  return (
    <Head>
      <link
        rel="icon"
        href={href}
        {...(icon.endsWith(".svg") ? { type: "image/svg+xml" } : {})}
      />
    </Head>
  );
}

export default function Root({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <>
      <Favicon />
      {children}
    </>
  );
}
