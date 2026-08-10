import React from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";

import styles from "./styles.module.css";

type BannerProps = {
  Logo: React.ComponentType<React.ComponentProps<"svg">>;
  name: string;
  children: React.ReactNode;
};

/**
 * The hero of a component overview page: the component's logo and name over
 * its one-paragraph definition, all centered. Pages using it set
 * `hide_title: true` — the banner's name is the page's h1. The overview page
 * carries nothing after the cards, so Docusaurus's own "Next: Get started"
 * pagination is the page's call to action.
 */
export default function ComponentBanner({
  Logo,
  name,
  children,
}: BannerProps): JSX.Element {
  return (
    // Not a <header>: the docs theme zeroes the top margin of whatever
    // follows a header element, which would glue the cards to the banner.
    <div className={styles.banner}>
      <Logo className={styles.logo} role="img" aria-hidden="true" />
      <Heading as="h1" className={styles.name}>
        {name}
      </Heading>
      <div className={styles.tagline}>{children}</div>
    </div>
  );
}

/**
 * The component's sub-components (engines, editors, capabilities) as cards.
 * `wideLast` puts the cards in two columns and lets the last one span both,
 * for an odd card out that would otherwise sit alone in a ragged row.
 */
export function FeatureGrid({
  wideLast,
  stacked,
  children,
}: {
  wideLast?: boolean;
  /** One full-width card per row, rather than a grid of columns. */
  stacked?: boolean;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div
      className={clsx(
        styles.grid,
        wideLast && styles.gridWideLast,
        stacked && styles.gridStacked,
      )}
    >
      {children}
    </div>
  );
}

export function Feature({
  title,
  id,
  media,
  mediaSide,
  children,
}: {
  title: string;
  id?: string;
  /** Optional illustration. Shown above the title unless `mediaSide` is set. */
  media?: React.ReactNode;
  /** Put the illustration beside the text instead of above it. */
  mediaSide?: "left" | "right";
  children: React.ReactNode;
}): JSX.Element {
  return (
    <section
      className={clsx(
        styles.feature,
        mediaSide && styles.featureRow,
        mediaSide === "right" && styles.featureRowReverse,
      )}
    >
      {media}
      <div>
        <Heading as="h2" id={id} className={styles.featureTitle}>
          {title}
        </Heading>
        {children}
      </div>
    </section>
  );
}
