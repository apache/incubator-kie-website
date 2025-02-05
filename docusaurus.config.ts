import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Apache KIE (incubating)",
  tagline:
    "The home of the most popular business automation open-source technologies",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://kie.apache.org/",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

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
  plugins: [require.resolve("docusaurus-lunr-search")],
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
          sidebarId: "documentationSidebar",
          position: "right",
          label: "Documentation",
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
        {
          type: "docSidebar",
          sidebarId: "communitySidebar",
          position: "right",
          label: "Community",
        },
        { to: "/blog", label: "Blog", position: "right" },
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
          href: "https://github.com/orgs/apache/repositories?language=&q=incubator-kie-&sort=&type=all",
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
          title: "Community",
          items: [
            {
              label: "Dev Mailing list",
              href: "https://lists.apache.org/list.html?dev@kie.apache.org",
            },
            {
              label: "Users Mailing list",
              href: "https://lists.apache.org/list.html?users@kie.apache.org",
            },
            {
              label: "Zulip Chat",
              href: "https://kie.zulipchat.com/",
            },
            {
              label: "Twitter",
              href: "https://twitter.com/kiecommunity",
            },
          ],
        },
        {
          title: "Docs",
          items: [
            {
              label: "Download",
              to: "/docs/start/download",
            },
            {
              label: "Examples",
              to: "/docs/examples",
            },
          ],
        },
        {
          title: "Repositories",
          items: [
            {
              label: "Drools",
              href: "https://github.com/apache/incubator-kie-drools",
            },
            {
              label: "Kogito Runtimes",
              href: "https://github.com/apache/incubator-kie-kogito-runtimes",
            },
            {
              label: "Kogito Apps",
              href: "https://github.com/apache/incubator-kie-kogito-apps",
            },
            {
              label: "Optaplanner",
              href: "https://github.com/apache/incubator-kie-optaplanner",
            },
            {
              label: "Tools",
              href: "https://github.com/apache/incubator-kie-tools",
            },
            {
              label: "Website",
              href: "https://github.com/apache/incubator-kie-website",
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
