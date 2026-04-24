import {useEffect} from 'react';
import {useLocation, useHistory} from '@docusaurus/router';

export default function Root({children}: {children: React.ReactNode}): JSX.Element | null {
  const location = useLocation();
  const history = useHistory();

  return <>{children}</>;
}
