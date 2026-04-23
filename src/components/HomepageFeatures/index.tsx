import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Drools',
    Svg: require('@site/static/img/drools.svg').default,
    description: (
      <>
        Drools description
      </>
    ),
  },
  {
    title: 'jBPM',
    Svg: require('@site/static/img/jbpm.svg').default,
    description: (
      <>
        jBPM description
      </>
    ),
  },
  {
    title: 'SonataFlow',
    Svg: require('@site/static/img/sonataflow.svg').default,
    description: (
      <>
        SonataFlow description
      </>
    ),
  },
  {
    title: 'OptaPlanner',
    Svg: require('@site/static/img/planner.svg').default,
    description: (
      <>
        OptaPlanner description.
      </>
    ),
  },
  {
    title: 'Kogito',
    Svg: require('@site/static/img/kogito.svg').default,
    description: (
      <>
        Kogito description.
      </>
    ),
  },
  {
    title: 'Tools',
    Svg: require('@site/static/img/tools.svg').default,
    description: (
      <>
        Tools description.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
