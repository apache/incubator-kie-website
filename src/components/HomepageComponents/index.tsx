import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type ComponentItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  to: string;
};

const ComponentList: ComponentItem[] = [
  {
    title: 'Drools',
    Svg: require('@site/static/img/drools.svg').default,
    to: '/drools',
  },
  {
    title: 'OptaPlanner',
    Svg: require('@site/static/img/planner.svg').default,
    to: '/optaplanner',
  },
  {
    title: 'jBPM',
    Svg: require('@site/static/img/jbpm.svg').default,
    to: '/jbpm',
  },
  {
    title: 'Kogito',
    Svg: require('@site/static/img/kogito.svg').default,
    to: '/kogito',
  },
  {
    title: 'SonataFlow',
    Svg: require('@site/static/img/sonataflow.svg').default,
    to: '/sonataflow',
  },
  {
    title: 'Tools',
    Svg: require('@site/static/img/tools.svg').default,
    to: '/tools',
  },
];

function ComponentCard({title, Svg, to}: ComponentItem) {
  return (
    <div className={clsx('col')}>
      <Link to={to} className={styles.componentLink}>
        <div className="text--center">
          <Svg className={styles.componentSvg} role="img" />
        </div>
        <div className="text--center padding-horiz--md">
          <Heading as="h3" className={styles.componentTitle}>
            {title}
          </Heading>
        </div>
      </Link>
    </div>
  );
}

export default function HomepageComponents(): JSX.Element {
  return (
    <section className={styles.components}>
      <div className="container">
        <div className="row">
          {ComponentList.map((props, idx) => (
            <React.Fragment key={idx}>
              {props.title === 'Tools' && (
                <div className={styles.separator} aria-hidden="true">
                  <span className={styles.separatorDot} />
                </div>
              )}
              <ComponentCard {...props} />
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
