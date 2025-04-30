---
id: jbpm
title: jBPM
sidebar_position: 0
---

# jBPM



## What is jBPM?

jBPM is a toolkit for building business applications to help automate business processes and decisions.

jBPM originates from BPM (Business Process Management) but it has evolved to enable users to pick their own path in business automation. It provides various capabilities that simplify and externalize business logic into reusable assets such as cases, processes, decision tables and more.

* business processes (BPMN2) 
* case management (BPMN2 and CMMN) 
* decision management (DMN) 
* business rules (DRL) 
* business optimisation (Solver)

jBPM can be used as standalone service or embedded in custom service. It does not mandate any of the frameworks to be used, it can be successfully used in

* traditional JEE applications - war/ear deployments 
* SpringBoot or Thorntail (formerly known as WildFly Swarm) - uberjar deployments 
* standalone Java programs

jBPM is typically used to build business applications. A business application could be defined as a domain-specific solution (built with selected frameworks and capabilities) that solves a particular business problem. To implement the business logic it leverages capabilities from various frameworks like business processes, business rules and planning constraints, but also persistence, messaging, transactions, etc.

jBPM is open source software, released under the Apache License 2.0. It is written in 100% pure Java™, runs on any JVM and is available in the Maven Central repository too.

## Cloud-native?

Looking for a pure cloud-native process automation solution, specifically targeted towards creating intelligent business applications in the cloud? Take a look at [Kogito](/docs/components/kogito), based on jBPM.


## What does jBPM do?

A business process allows you to model your business goals by describing the steps that need to be executed to achieve that goal and the order, using a flow chart. This greatly improves the visibility and agility of your business logic, results in higher-level and domain-specific representations that can be understood by business users and is easier to monitor.

The core of jBPM is a light-weight, extensible workflow engine written in pure Java that allows you to execute business processes using the latest BPMN 2.0 specification. It can run in any Java environment, embedded in your application or as a service.

On top of the core engine, a lot of features and tools are offered to support business processes throughout their entire life cycle:

* Eclipse-based and web-based editor to support the graphical creation of your business processes and case definitions (drag & drop). 
* Pluggable persistence and transactions based on JPA / JTA. 
* Pluggable human task service based on WS-HumanTask for including tasks that need to be performed by human actors. 
* Management console supporting process instance management, task lists and task form management, and reporting. 
* Optional process repository to deploy your process (and other related knowledge). 
* History logging (for querying / monitoring / analysis). 
* Integration with various frameworks such as CDI/EJB, Spring(Boot), OSGi, etc.

BPM makes the bridge between business analysts, developers and end users, by offering process management features and tools in a way that both business users and developers like it. Domain-specific nodes can be plugged into the palette, making the processes more easily understood by business users.

jBPM supports adaptive and dynamic processes that require flexibility to model complex, real-life situations that cannot easily be described using a rigid process. We bring control back to the end users by allowing them to control which parts of the process should be executed, to dynamically deviate from the process, etc.

jBPM is also not just an isolated process engine. Complex business logic can be modeled as a combination of business processes with business rules and complex event processing. jBPM can be combined with the Drools project to support one unified environment that integrates these paradigms where you model your business logic as a combination of processes, rules and events.

## Documentation
Please refer to [Documentation](https://kie.apache.org/docs/documentation/) for the latest features.

## Slides
These slides are viewable in your browser:

[Show the jBPM presentations](http://www.slideshare.net/krisverlaenen/presentations)


## Books
[![Mastering jBPM6]( mastering_jbpm6.png 'Mastering jBPM6')](http://kverlaen.blogspot.be/2015/07/book-mastering-jbpm6.html)
[![Mastering jBPM6]( jbpm6_developer_guide.png 'jBPM6 Developer Guide')](http://kverlaen.blogspot.be/2014/09/jbpm6-developer-guide.html)
[![Mastering jBPM6]( jbpm5_developer_guide.png 'jBPM5 Developer Guide')](http://kverlaen.blogspot.be/2012/12/book-jbpm5-developer-guide.html)
[![Mastering jBPM6]( efficient_business_process_management.png 'Efficient Business Process Management')](http://www.schabell.org/2018/03/book-launced-effective-business-process-management-with-jboss-bpm.html)
