---
id: guides
title: Guides
sidebar_position: 2
---

You have gone through the [Get started guides](/kogito/get-started). You are
now ready to dive into specific topic guides.

## Process services

### [Developing process services with Kogito](pathname:///docs/10.2.x/kogito/#chap-kogito-developing-process-services)

As a developer of business processes, you can use Kogito business automation to
develop process services using
[Business Process Model and Notation (BPMN) 2.0](https://www.omg.org/spec/BPMN/2.0/)
models. BPMN 2.0 process models are graphical representations of the steps
required to achieve a business goal. You can design your BPMN 2.0 processes
with the Kogito BPMN modeler in VS Code or import existing BPMN 2.0 processes
into your Kogito projects for deployment and execution.

### [BPMN 2.0 support in Kogito](pathname:///docs/10.2.x/kogito/#con-bpmn_kogito-developing-process-services)

Business Process Model and Notation (BPMN) 2.0 is a standard established by the
[Object Management Group (OMG)](https://www.omg.org/) for describing and
modeling business processes.

### [Persistence in Kogito services](pathname:///docs/10.2.x/kogito/#con-persistence_kogito-developing-process-services)

Kogito supports runtime persistence for preserving process data in your
services across application restarts. Kogito persistence is based on key-value
storage to persist data, such as active process nodes and process instance
variables.

### [Kogito Management Console](pathname:///docs/10.2.x/kogito/#con-management-console_kogito-developing-process-services)

The Kogito Management Console is a user interface for viewing the state of all
available Kogito services and managing process instances. You can use the
Management Console to view process, subprocess, and node instance details,
abort process instances, and view domain-specific process data.

## Decision services

### [Developing decision services with Kogito](pathname:///docs/10.2.x/kogito/#collection-kogito-developing-decision-services)

As a developer of business decisions, you can use Kogito business automation to
develop decision services using
[Decision Model and Notation (DMN)](https://www.omg.org/spec/DMN/) models,
Drools Rule Language (DRL) rules, XLS or XLSX spreadsheet decision tables, or a
combination of all three methods.

### [Using DMN models in Kogito services](pathname:///docs/10.2.x/kogito/#chap-kogito-using-dmn-models)

As a business analyst or business rules developer, you can use Decision Model
and Notation (DMN) to model a decision service graphically in a decision
requirements diagram (DRD). This diagram consists of one or more decision
requirements graphs (DRGs) that trace business decisions from start to finish,
with each decision node using logic defined in DMN boxed expressions such as
decision tables.

### [Using DRL rules in Kogito services](pathname:///docs/10.2.x/kogito/#chap-kogito-using-drl-rules)

As a developer of business decisions, you can define business rules using
Drools Rule Language (DRL) directly in free-form .drl text files. A DRL file
can contain one or more rules that define at a minimum the rule conditions
(when) and actions (then).

### [Using spreadsheet decision tables in Kogito services](pathname:///docs/10.2.x/kogito/#chap-kogito-using-spreadsheet-decision-tables)

As a developer of business decisions, you can define business rules in a
tabular format in spreadsheet decision tables and then include the spreadsheet
file in your Kogito project. These rules are compiled into Drools Rule Language
(DRL) for the decision service in your project.

### [Decision engine in Kogito](pathname:///docs/10.2.x/kogito/#chap-kogito-decision-engine)

As a developer of business decisions, your understanding of the decision engine
in Kogito can help you design more effective business assets and a more
scalable decision management architecture. The decision engine is the Kogito
component that stores, processes, and evaluates data to execute business rules
and to reach the decisions that you define.

## Environment configuration

### [Configuring Kogito supporting services and runtime capabilities](pathname:///docs/10.2.x/kogito/#chap-kogito-configuring)

As a developer of business processes and decisions, you can configure Kogito
supporting services and runtime properties for advanced use cases with your
Kogito services.

### [Using the Kogito Data Index Service](pathname:///docs/10.2.x/kogito/#con-data-index-service_kogito-configuring)

Kogito provides a Data Index Service that stores all Kogito events related to
processes, tasks, and domain data. The Data Index Service is at the core of all
Kogito search, insight, and management capabilities.

### [Using the Kogito Jobs Service](pathname:///docs/10.2.x/kogito/#con-jobs-service_kogito-configuring)

Kogito provides a Jobs Service for scheduling Business Process Model and
Notation (BPMN) 2.0 process events that are configured to be executed at a
specified time. These time-based events in a process model are known as jobs.
