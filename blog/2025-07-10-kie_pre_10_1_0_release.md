---
slug: kie_10_1_0_release
title: Apache KIE (Incubating) 10.1.0 Release Announcement
authors: [porcelli]
tags: [apache, 10, kie, release]
---

# Apache KIE (Incubating) 10.1.0 Release Announcement

We are pleased to announce the release of **Apache KIE (Incubating) 10.1.0**, the first follow-up milestone since the project's rebirth under the Apache Software Foundation. This release reflects the project's continued momentum and commitment to modernization, usability, and stability across the KIE components: Drools, jBPM, OptaPlanner, Kogito, SonataFlow and Tools.

## Laying Groundwork for the Future

Following the foundational work in 10.0.0, this release introduces key upgrades and deprecations, improves compatibility, and continues efforts to simplify the developer and authoring experience. While not as sweeping as the prior release, 10.1.0 brings meaningful enhancements across the stack.

### Platform Upgrades

- Quarkus upgraded to version `3.15.3.1` (from 3.8.4)
- Spring Boot upgraded to version `3.4.3` (from 3.2.6) 

These updates align with our goal of keeping KIE technologies up-to-date with modern Java ecosystems.

### Drools

#### Advancing Rule Units
Rule Units remain targeted at greenfield projects and continue to evolve. These projects are better positioned to work around current limitations.

While RuleUnits provide a strong foundation, there are critical gaps that must be addressed before they can be considered a complete replacement for classic DRL. Examples include ambiguity in OOPath syntax, limited support for Decision Tables, and a lack of comprehensive test coverage.

Improvements are being investigated to simplify the use of OOPath in combination with accumulate and to improve the overall authoring experience.

#### Rule Orchestration / startProcess
The startProcess() API has been deprecated since version 8.x and should not be called from client code, as doing so will result in a RuntimeException. Although the method still exists due to internal dependencies and because it is part of a shared interface with jBPM, it is no longer functional and is expected to be removed in a future version.
The recommended approach is to use the new code-generation-based process.


#### DMN 1.5 Support
Both the editor and engine now support the latest **DMN 1.5** specification.

### jBPM and Kogito
- Introduction of a new user task subsystem
- Support for transactions in compact architecture
- Infinispan usage is now deprecated and will be removed in the next version

### SonataFlow Operator Enhancements
- Incorporates the ability to configure the SonataFlow workflows and supporting services databases using the SonataFlowPlatform.
- Incorporates the ability to initialize the supporting services databases using a dedicated Job, via configuration in the SonataFlowPlatForm.
- Incorporates the ability to produce all the events communications using the Knative Eventing System, via configuration in the SonataFlowPlatform.

### Tooling Updates
- A new Test Scenario Editor with full DMN 1.5 support is now available  
- Classic DMN Editor and native binaries for Extended Services are both deprecated and will be removed in the next release

## Known Limitations
- JIT runners are not working on **Windows** and **macOS**

## Join the Conversation

Have questions or want to connect with the community? We encourage all users to join the official user mailing list:

**[users@kie.apache.org](https://lists.apache.org/list.html?users@kie.apache.org)**  
This is the best place to ask for help, share feedback, or discuss how you are using Apache KIE in your projects.


## Download

Apache KIE (Incubating) 10.1.0 is available now. Visit the [official download page](/downloads/download_10_1_0) for the artifacts and to explore what's new.

We welcome your feedback and contributions. Thank you for being part of this growing community.
