---
id: components
title: Components
sidebar_position: 1
---

The components that make up Apache KIE predate the umbrella by many years. Each
one stands on its own, and they are designed to work together.

## [Drools](/drools)

The rule engine at the core of KIE. Started in 2001 as an open source rule
engine and grew into a full business rule management system, today covering DRL
rules and the [DMN](https://www.omg.org/spec/DMN/) decision standard.

## [OptaPlanner](/optaplanner)

A constraint solver for planning problems — scheduling, routing, rostering and
the like. It began in 2006 as Drools Planner before becoming a project in its
own right.

## [jBPM](/jbpm)

A workflow engine for long-running business processes, covering
[BPMN 2.0](https://www.omg.org/spec/BPMN/2.0/), case management and human
tasks. From jBPM 5 onwards it was rebuilt around the same
knowledge core as Drools.

## [Kogito](/kogito)

The cloud-native generation of the engines, announced in 2019. It builds on
Quarkus and code generation to run rules, decisions and processes as
microservices.

## [SonataFlow](/sonataflow)

A workflow engine for building serverless applications, implementing the
[CNCF Serverless Workflow](https://serverlessworkflow.io/) specification —
SonataFlow worked with
[version 0.8](https://github.com/serverlessworkflow/specification/tree/0.8.x).
It grew out of Kogito.

## [Tools](/tools)

The editors, extensions and developer tooling used to author and run KIE assets.

## Along the way

Beyond the engines, the KIE community incubated a number of initiatives over the
years, some of which grew into projects of their own:

- [Dashbuilder](https://www.dashbuilder.org), for authoring dashboards and
  visualizing business data, today part of KIE Tools.
- [TrustyAI](https://github.com/trustyai-explainability), for explainability and
  auditing of AI-augmented decision services, which continues as an independent
  open source project.
