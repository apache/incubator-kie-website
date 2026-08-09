import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import HomepageComponents from '@site/src/components/HomepageComponents';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className={clsx('container', styles.heroContent)}>
        <img
          className={styles.heroLogo}
          src={useBaseUrl('/img/navbar-logo.svg')}
          alt=""
          aria-hidden="true"
        />
        <Heading as="h1" className={styles.heroTitle}>
          <span className={styles.heroTitleName}>
            <span className={styles.heroTitleApache}>Apache</span>{' '}
            <span className={styles.heroTitleKie}>KIE</span>
            <span className={styles.heroTitleTm}>™</span>
            <span className={styles.heroTitleSuffix}>incubating</span>
          </span>
        </Heading>
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
        <div className={styles.heroRule} aria-hidden="true" />
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <>
      <Layout
        title={`${siteConfig.title}`}
        description="@{siteConfig.tagline}"
        wrapperClassName="home-main">
        <HomepageHeader />
        <main>
          <HomepageComponents />
        </main>
      </Layout>
    </>
  );
}
