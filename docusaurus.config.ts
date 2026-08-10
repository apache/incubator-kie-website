import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Apache KIE (incubating)",
  tagline:
    "The home of the most popular business automation open-source technologies",
  // The favicon is set in src/theme/Root.tsx, not here: pages under a
  // component hotsite fly that component's logo instead of the site icon, and
  // with both set two `rel="icon"` links are emitted, the last one winning.

  // Set the production url of your site here
  url: "https://kie.apache.org/",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  headTags: [
    {
      tagName: 'meta',
      attributes: {
        'http-equiv': 'Content-Security-Policy',
        content: "default-src 'self' data: blob: 'unsafe-inline' 'unsafe-eval' https://gravatar.com https://*.gravatar.com",
      },
    },
  ],

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          routeBasePath: "/",
        },
        blog: {
          blogSidebarCount: "ALL",
          blogSidebarTitle: "All our posts",
          showReadingTime: true,
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],
  plugins: [
    require.resolve("docusaurus-lunr-search"),
    [
      "@docusaurus/plugin-client-redirects",
      {
        // Each component used to live under /components/<name> in the docs
        // tree. They now have their own sections at the site root, so the old
        // paths are redirected to keep inbound links working.
        redirects: [
          { from: "/components/drools", to: "/drools/" },
          { from: "/components/drools/drools_books", to: "/drools/books" },
          { from: "/components/drools/drools_dmn", to: "/drools/dmn" },
          { from: "/components/drools/drools_papers", to: "/drools/papers" },
          {
            from: "/components/drools/drools_upgrade_recipe",
            to: "/drools/upgrade-recipe",
          },
          { from: "/components/drools/drools_videos", to: "/drools/videos" },
          { from: "/components/optaplanner", to: "/optaplanner/" },
          { from: "/components/jbpm", to: "/jbpm/" },
          {
            from: "/components/jbpm/getting_started",
            to: "/jbpm/get-started",
          },
          { from: "/jbpm/getting-started", to: "/jbpm/get-started" },
          { from: "/components/kogito", to: "/kogito/" },
          { from: "/components/sonataflow", to: "/sonataflow/" },
          { from: "/components/tools", to: "/tools/" },
        ],

        // The docs plugin's `routeBasePath` was changed from "/docs" to "/",
        // moving every docs page from `/docs/<x>` to `/<x>`. This plugin
        // emits a static HTML redirect at `/docs/<x>` for each existing
        // route so pre-existing bookmarks and inbound links keep working.
        //
        // Static sites under `/docs/10.0.x/**` and `/docs/10.1.x/**`
        // (copied into `static/docs/` by .github/workflows/deploy.yml) are
        // plain files, not Docusaurus routes, so no redirect is generated
        // for them and they continue to be served as-is by GitHub Pages.
        createRedirects(existingPath: string) {
          if (existingPath === "/" || existingPath === "/docs") {
            return undefined;
          }
          if (existingPath.startsWith("/docs/")) {
            return undefined;
          }
          return [`/docs${existingPath}`];
        },
      },
    ],
  ],
  themeConfig: {
    // Replace with your project's social card
    navbar: {
      title: "",
      logo: {
        alt: "KIE Logo",
        src: "img/navbar-logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "aboutSidebar",
          position: "right",
          label: "About",
        },
        {
          type: "dropdown",
          label: "Components",
          position: "right",
          // Kept in the same order, and with the same labels, as the cards in
          // src/components/HomepageComponents.
          items: [
            { label: "Drools", to: "/drools/" },
            { label: "OptaPlanner", to: "/optaplanner/" },
            { label: "jBPM", to: "/jbpm/" },
            { label: "Kogito", to: "/kogito/" },
            { label: "SonataFlow", to: "/sonataflow/" },
            { label: "Tools", to: "/tools/" },
          ],
        },
        {
          type: "docSidebar",
          sidebarId: "documentationSidebar",
          position: "right",
          label: "Docs",
        },
        {
          type: "docSidebar",
          sidebarId: "downloadSidebar",
          position: "right",
          label: "Downloads",
        },
        {
          type: "docSidebar",
          sidebarId: "examplesSidebar",
          position: "right",
          label: "Examples",
        },
        { to: "/blog", label: "Blog", position: "right" },
        {
          type: "docSidebar",
          sidebarId: "communitySidebar",
          position: "right",
          label: "Community",
        },
        {
          type: "dropdown",
          label: "ASF",
          position: "right",
          items: [
            {
              label: "Foundation",
              to: "https://www.apache.org/",
            },
            {
              label: "License",
              to: "https://www.apache.org/licenses/",
            },
            {
              label: "Events",
              to: "https://www.apache.org/events/current-event.html",
            },
            {
              label: "Privacy",
              to: "https://privacy.apache.org/policies/privacy-policy-public.html",
            },
            {
              label: "Security",
              to: "https://www.apache.org/security/",
            },
            {
              label: "Sponsorship",
              to: "https://www.apache.org/foundation/sponsorship.html",
            },
            {
              label: "Thanks",
              to: "https://www.apache.org/foundation/thanks.html",
            },
            {
              label: "Code of Conduct",
              to: "https://www.apache.org/foundation/policies/conduct.html",
            },
          ],
        },
        {
          href: "https://github.com/orgs/apache/repositories?q=visibility%3Apublic+archived%3Afalse+incubator-kie",
          position: "right",
          className: "header-github-link",
          "aria-label": "GitHub repositories",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Components",
          items: [
            { label: "Drools", to: "/drools" },
            { label: "OptaPlanner", to: "/optaplanner" },
            { label: "jBPM", to: "/jbpm" },
            { label: "Kogito", to: "/kogito" },
            { label: "SonataFlow", to: "/sonataflow" },
            { label: "Tools", to: "/tools" },
          ],
        },
        {
          title: "Get involved",
          items: [
            {
              label: "Users Mailing list",
              href: "https://lists.apache.org/list.html?users@kie.apache.org",
            },
            {
              label: "Dev Mailing list",
              href: "https://lists.apache.org/list.html?dev@kie.apache.org",
            },
            {
              label: "Zulip Chat",
              href: "https://kie.zulipchat.com/",
            },
            {
              label: "Twitter",
              href: "https://twitter.com/kiecommunity",
            },
            {
              label: "YouTube",
              href: "https://www.youtube.com/@KIE-community-channel",
            },
          ],
        },
        {
          title: "Learn",
          items: [
            {
              label: "About",
              to: "/about",
            },
            {
              label: "Documentation",
              to: "/documentation",
            },
            {
              label: "Downloads",
              to: "/downloads",
            },
            {
              label: "Examples",
              to: "/examples",
            }
          ],
        },
        {
          title: "Code",
          items: [
            {
              label: "KIE (Drools, jBPM, OptaPlanner, and Kogito)",
              href: "https://github.com/apache/incubator-kie",
            },
            {
              label: "Tools",
              href: "https://github.com/apache/incubator-kie-tools",
            },
            {
              label: "Examples",
              href: "https://github.com/apache/incubator-kie-examples",
            },
            {
              label: "Website",
              href: "https://github.com/apache/incubator-kie-website",
            },
            {
              label: "Docs",
              href: "https://github.com/apache/incubator-kie-docs",
            },
          ],
        },
      ],
      logo: {
        width: 200,
        src: "/img/apache-incubator.svg",
        href: "https://incubator.apache.org/",
        alt: "Apache Incubator logo",
      },
      copyright: `<div>
      <p> Apache KIE is an effort undergoing incubation at The Apache Software Foundation (ASF), sponsored by the Apache Incubator. Incubation is required of all newly accepted projects until a further review indicates that the infrastructure, communications, and decision making process have stabilized in a manner consistent with other successful ASF projects. While incubation status is not necessarily a reflection of the completeness or stability of the code, it does indicate that the project has yet to be fully endorsed by the ASF. </p>
      <p>
        Copyright © ${new Date().getFullYear()} The Apache Software Foundation, Licensed under the Apache License, Version 2.0. <br/>
        Apache, the names of Apache projects, and the feather logo are either registered trademarks or trademarks of the Apache Software Foundation in the United States and/or other countries.
      </p>
      </div>`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: [
        "java",
        "javascript",
        "rust",
        "cpp",
        "c",
        "bash",
        "scala",
        "python",
      ],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

