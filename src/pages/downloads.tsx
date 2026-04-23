import {Redirect} from '@docusaurus/router';

// Latest release — update for each new release
export default function DownloadsRedirect(): JSX.Element {
  return <Redirect to="/downloads/download_10_1_0" />;
}
