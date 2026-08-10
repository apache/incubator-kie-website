---
id: what-is-jbpm
title: What is jBPM?
sidebar_position: 2
---

jBPM originates from BPM (Business Process Management) but it has evolved to enable users to pick their own path in business automation. It provides various capabilities that simplify and externalize business logic into reusable assets such as processes, tasks, decision tables and more.

* business processes ([BPMN 2.0](https://www.omg.org/spec/BPMN/2.0/))
* human tasks, with pluggable lifecycles, assignment strategies and deadlines
* decision management ([DMN](https://www.omg.org/spec/DMN/))
* business rules (DRL)

jBPM is a workflow engine, not a server: it is a set of Java libraries that your service embeds. In Apache KIE 10 the supported way to build that service is [Kogito](/kogito), on either [Quarkus](https://quarkus.io/) or [Spring Boot](https://spring.io/projects/spring-boot). Your BPMN 2.0 models are compiled at build time into the code that runs them, so there is no runtime deployment step and no process repository to manage.

jBPM is typically used to build business applications. A business application could be defined as a domain-specific solution (built with selected frameworks and capabilities) that solves a particular business problem. To implement the business logic it leverages capabilities from various frameworks like business processes and business rules, but also persistence, messaging, transactions, etc.

jBPM is open source software, released under the Apache License 2.0. It is written in 100% pure Java™, runs on any JVM and is available in the Maven Central repository too.

## Cloud-native?

Looking for a pure cloud-native process automation solution, specifically targeted towards creating intelligent business applications in the cloud? Take a look at [Kogito](/kogito) — it is the cloud-native runtime that the jBPM engine ships inside, so the two are not alternatives: when you add process capabilities to a Kogito service, jBPM is what executes them. Start at [Get started](/jbpm/get-started).

## What does jBPM do?

A business process allows you to model your business goals by describing the steps that need to be executed to achieve that goal and the order, using a flow chart. This greatly improves the visibility and agility of your business logic, results in higher-level and domain-specific representations that can be understood by business users and is easier to monitor.

The core of jBPM is a light-weight, extensible workflow engine written in pure Java that allows you to execute business processes using the latest BPMN 2.0 specification. It can run in any Java environment, embedded in your application or as a service.

Its BPMN 2.0 coverage is broad: all the gateways (exclusive, inclusive, parallel, complex and event-based), intermediate catch and throw events, boundary events, errors, escalations, signals, messages, timers and links, embedded, event and ad-hoc sub-processes, call activities, multi-instance activities, compensation and transactions, lanes, and collaboration with message correlation.

On top of the core engine, a lot of features and tools are offered to support business processes throughout their entire life cycle:

* Web-based and IDE-based [modelers](/tools/) to support the graphical creation of your business processes (drag & drop).
* Pluggable persistence for long-running process state — PostgreSQL and other JDBC databases, MongoDB, Infinispan, RocksDB or the filesystem — added to your service as an add-on.
* A human task service for including tasks that need to be performed by human actors, including a WS-HumanTask-compatible lifecycle.
* Consoles supporting process instance management, task lists and task form management, backed by the Data Index and audit services.
* Timers and scheduled work, delegated to an embedded scheduler or to a standalone Jobs Service.
* Service-level agreement tracking, and migration of already-running process instances onto a new version of a process definition.
* History logging (for querying / monitoring / analysis) through the Data Index and Data Audit add-ons.

BPM makes the bridge between business analysts, developers and end users, by offering process management features and tools in a way that both business users and developers like it. Domain-specific nodes can be plugged into the palette — declare them in a work item definition (`.wid`) file and the [BPMN editor](/tools/) picks them up as custom tasks — making the processes more easily understood by business users.

jBPM is also not just an isolated process engine. Complex business logic can be modeled as a combination of business processes with business rules and decisions: a business rule task in your process calls straight into a DRL rule set or a DMN decision, evaluated by [Drools](/drools) in the same service.
