---
slug: kie_10_2_0_release
title: Apache KIE (Incubating) 10.2.0 Release Announcement
authors: [bowers]
tags: [apache, 10, kie, release]
---

# Apache KIE (Incubating) 10.2.0 Release Announcement

We are excited to announce the release of **Apache KIE (Incubating) 10.2.0**, marking another significant milestone in the project's evolution under the Apache Software Foundation. This release represents a major step forward in modernization and Apache compliance, with substantial improvements to tooling and platform dependencies.

## A Major Leap in Modernization

The 10.2.0 release focuses on critical infrastructure improvements and a transformative update to our editing capabilities. This release removes legacy dependencies and introduces modern tooling that aligns with Apache guidelines and contemporary development practices.

### Important Tooling Changes

#### New BPMN Editor

The most significant change in this release is the introduction of the **new BPMN Editor**. This modern editor replaces the legacy GWT-based tooling and represents a fundamental shift in our approach to process modeling.

Key benefits of the new BPMN Editor:
- Modern, responsive user interface
- Improved performance and user experience
- Better integration with contemporary web technologies
- Enhanced maintainability and extensibility

#### Removal of Classic Editors

As part of our commitment to modernization and Apache compliance, we have **removed the classic BPMN and DMN editors**. These GWT-based editors have been deprecated in previous releases, and their removal in 10.2.0 brings us one step closer to graduating.


### Platform Upgrades

- Quarkus upgraded to version `3.27.2` (from 3.15.3.1)
- Spring Boot upgraded to version `3.5.10` (from 3.4.3)
- Java 21 support

These updates ensure KIE technologies remain current with the latest Java ecosystem advancements, providing improved performance, security, and feature sets.

### Drools

#### Rule Engine Enhancements
- Fixed critical issues with activation groups and agenda groups
- Improved executable model generation with deterministic argument ordering
- Enhanced memory management to prevent leaks in dormant matches
- Better handling of custom operators in executable model
- Resolved issues with rule firing after session restoration

#### Build and Tooling
- Improved Maven and Gradle build discovery
- Enhanced kJar code generation with better error reporting
- Support for Java versions 19+ in DRL compilation

#### DMN 1.6 Support
Both the editor and engine now support the latest **DMN 1.6** specification.

### jBPM and Kogito
- Test Scenario engine modernized to use JUnit 5
- Gradle 9.2 support for Kogito projects
- Process Instance Migration (PIM) externalized to independent addon with improved functionality
- User Tasks major performance improvements with reduced database queries, new indexes, and WS-Human Task Lifecycle support
- Data Index new Spring Boot persistence addons (JPA and common), improved GraphQL queries, and custom UI support
- Job Service enhanced reliability with better error handling, configurable retry scheduling, and custom collocated service support
- Security improvements including OAuth2 token exchange, JWT token parsing, and secured task management API
- OpenTelemetry support for process instance aware logging and distributed tracing
- Cloud Events improved event handling with proper headers propagation and Knative eventing support
- Spring Boot enhanced compatibility with new addons and improved transaction handling

### SonataFlow Operator Enhancements
- Incorporates native Horizontal Pod Autoscaler (HPA) support for SonataFlow workflows and Data Index service deployments
- Incorporates native Pod Disruption Budget (PDB) support for SonataFlow workflows and Data Index service deployments
- Incorporates the ability to configure leader lease parameters for improved operator reliability
- Enhanced database configuration options for Data Index and Job Service PostgreSQL deployments
- Improved catalog image management and platform configuration for air-gapped installations
- Support for configurable Quarkus registry and offline dependency caching

### Tooling Updates
- PatternFly v5 major UI framework upgrade across all editors and consoles
- KIE Sandbox GitLab support, improved authentication, and enhanced DMN Runner with lenient/strict mode selection
- Management Console read-only mode support, improved OpenTelemetry integration, and enhanced user experience
- Build Tools Gradle plugin improvements, enhanced Maven plugin, and better build discovery
- Various bug fixes and UX improvements across all tooling components

### OptaPlanner
- Removed experimental optaplanner-operator to streamline the codebase
- Documentation migrated to unified kie-docs repository

## Acknowledgments

We would like to extend a special thank you to **Alex Procelli** for his exceptional work in helping to deliver this release. His dedication and effort were instrumental in bringing 10.2.0 to completion in an accelerated timeframe.

We also want to recognize **Tiago Bento** for his contribution of the new and improved BPMN Editor. This work represents a major advancement in our tooling capabilities and will benefit the entire Apache KIE community for years to come.

## Join the Conversation

Have questions or want to connect with the community? We encourage all users to join the official user mailing list:

**[users@kie.apache.org](https://lists.apache.org/list.html?users@kie.apache.org)**  
This is the best place to ask for help, share feedback, or discuss how you are using Apache KIE in your projects.

## Download

Apache KIE (Incubating) 10.2.0 is available now. Visit the [official download page](/start/download) for the artifacts and to explore what's new.

We welcome your feedback and contributions. Thank you for being part of this growing community and supporting our journey toward a more modern, Apache-compliant future.