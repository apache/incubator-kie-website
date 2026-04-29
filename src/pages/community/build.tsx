import {Redirect} from '@docusaurus/router';

// Latest release — update for each new release
export default function BuildRedirect(): JSX.Element {
  return <Redirect to="/community/devs/build-10.2" />;
}
