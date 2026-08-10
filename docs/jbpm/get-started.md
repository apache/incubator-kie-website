---
id: get-started
title: Get started
sidebar_position: 1
---

Everything you need to build and run your first process service. In Apache
KIE 10, the jBPM process engine ships inside [Kogito](/kogito) — you build a
Kogito service and model your processes in
[BPMN 2.0](https://www.omg.org/spec/BPMN/2.0/).

## Prerequisites

1. **An IDE** — [VS Code](https://code.visualstudio.com/Download) (preferred),
   [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) or
   [Eclipse](https://www.eclipse.org/downloads/).
2. **JDK 21** (preferred) or JDK 17 — [Temurin](https://adoptium.net/) works
   well.
3. **Maven 3.9+** — [Apache Maven](https://maven.apache.org/).

## Step by step

1. **[Build your first service](pathname:///docs/10.2.x/kogito/#chap-kogito-creating-running)**
   — create a Maven project, design its logic in the Kogito modelers, then run
   the service and interact with it.
2. **[Model your process in BPMN 2.0](pathname:///docs/10.2.x/kogito/#proc-bpmn-model-creating_kogito-developing-process-services)**
   — create and edit BPMN 2.0 models in the [BPMN modeler](/tools/), from
   start event to end event.
3. **[Develop your process service](pathname:///docs/10.2.x/kogito/#chap-kogito-developing-process-services)**
   — process variables, user tasks, persistence, messaging, and integrating
   processes with decisions.

From here, the
[example applications](pathname:///docs/10.2.x/kogito/#proc-kogito-app-examples-running_kogito-creating-running)
include `orders.bpmn2`, a small process to run and pick apart. For jBPM 7 and
earlier releases, the manuals are under [Documentation](/documentation).
