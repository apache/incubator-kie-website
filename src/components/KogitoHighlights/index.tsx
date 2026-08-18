import useBaseUrl from "@docusaurus/useBaseUrl";

import { Feature, FeatureGrid } from "@site/src/components/ComponentBanner";
import styles from "./styles.module.css";

type Highlight = {
  title: string;
  image: string;
  /** Multiplier on the base illustration size; taller cards carry bigger art. */
  imageScale?: number;
  body: React.ReactNode;
};

const HIGHLIGHTS: Highlight[] = [
  {
    title: "Kogito ergo cloud",
    image: "/img/kogito/homepage_graphic_1",
    imageScale: 2,
    body: (
      <p>
        Kogito is designed from ground up to run at scale on cloud
        infrastructure. By taking advantage of the latest technologies (Quarkus,
        Spring Boot, etc.), you get amazingly fast boot times and instant
        scaling on orchestration platforms like Kubernetes.
      </p>
    ),
  },
  {
    title: "Kogito ergo domain",
    image: "/img/kogito/homepage_graphic_2",
    imageScale: 1.5,
    body: (
      <p>
        Kogito adapts to your business domain rather than the other way around.
        No more leaking abstraction of the tool into your client applications.
        Stay focused on what the business is about instead of being concerned
        with technology behind it.
      </p>
    ),
  },
  {
    title: "Kogito ergo power",
    image: "/img/kogito/homepage_graphic_3",
    imageScale: 2,
    body: (
      <>
        <p>
          Kogito offers a powerful developer experience based on battle-tested
          components:
        </p>
        <ul>
          <li>Tooling embeddable wherever you need it</li>
          <li>Code generation taking care of 80% of the work</li>
          <li>Flexibility to customize, only use what you need</li>
          <li>Simplified local development with live reload</li>
        </ul>
      </>
    ),
  },
];

function HighlightCard({
  highlight,
  mediaSide,
}: {
  highlight: Highlight;
  mediaSide: "left" | "right";
}): JSX.Element {
  const image = useBaseUrl(`${highlight.image}.png`);
  const image2x = useBaseUrl(`${highlight.image}@2x.png`);
  return (
    <Feature
      title={highlight.title}
      mediaSide={mediaSide}
      media={
        <img
          className={styles.image}
          style={
            {
              "--kie-highlight-image-scale": highlight.imageScale ?? 1,
            } as React.CSSProperties
          }
          src={image}
          srcSet={`${image} 1x, ${image2x} 2x`}
          alt=""
          aria-hidden="true"
        />
      }
    >
      {highlight.body}
    </Feature>
  );
}

/**
 * The three "Kogito ergo ..." cards, embedded in the Kogito overview doc.
 * Same cards as the other component overviews, but stacked full width with
 * the illustrations alternating side to side down the page.
 */
export default function KogitoHighlights(): JSX.Element {
  return (
    <FeatureGrid stacked>
      {HIGHLIGHTS.map((highlight, index) => (
        <HighlightCard
          key={highlight.title}
          highlight={highlight}
          mediaSide={index % 2 === 0 ? "left" : "right"}
        />
      ))}
    </FeatureGrid>
  );
}
