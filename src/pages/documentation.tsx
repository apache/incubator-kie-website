import {Redirect} from '@docusaurus/router';

// Latest release — update for each new release
export default function DocumentationRedirect(): JSX.Element {
  return <Redirect to="/documentation/documentation_10.1.0" />;
}
