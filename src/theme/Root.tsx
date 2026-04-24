import {useEffect, useLayoutEffect} from 'react';
import {useLocation, useHistory} from '@docusaurus/router';

export default function Root({children}: {children: React.ReactNode}): JSX.Element | null {
  const location = useLocation();
  const history = useHistory();

  useLayoutEffect(() => {
    if (location.pathname.startsWith('/docs/10')) {
      // These are separate static HTML sites copied into /docs/10.x/ at build time.
      // React Router has no route for them, so force a full page load.
      window.location.replace(location.pathname + location.search + location.hash);
    }
  }, [location]);

  useEffect(() => {
    if (location.pathname.startsWith('/docs/') && !location.pathname.startsWith('/docs/10')) {
      // @docusaurus/plugin-client-redirects only emits /docs/* → /* redirects at build time;
      // this handles the same mapping in `docusaurus start` so dev mode matches production.
      history.replace(
        location.pathname.slice('/docs'.length) + location.search + location.hash,
      );
    }
  }, [location, history]);

  if (location.pathname.startsWith('/docs/10')) {
    return null;
  }

  return <>{children}</>;
}
