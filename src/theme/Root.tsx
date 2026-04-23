import {useEffect} from 'react';
import {useLocation, useHistory} from '@docusaurus/router';

export default function Root({children}: {children: React.ReactNode}): JSX.Element {
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    // @docusaurus/plugin-client-redirects only emits /docs/* → /* redirects at build time;
    // this handles the same mapping in `docusaurus start` so dev mode matches production.
    if (location.pathname.startsWith('/docs/') && !location.pathname.startsWith('/docs/10')) {
      history.replace(
        location.pathname.slice('/docs'.length) + location.search + location.hash,
      );
    }
  }, [location, history]);

  return <>{children}</>;
}
