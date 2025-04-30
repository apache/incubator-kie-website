---
id: jbpm_getting_started
title: Getting Started
sidebar_position: 0
---

# Business Applications - Getting Started
## Overview

Business application can be defined as an automated solution, built with selected frameworks and capabilities that implements business functions and/or business problems. Capabilities can be (among others):

* persistence 
* messaging
* transactions 
* business processes, business rules 
* planning solutions

Business application is more of a logical grouping of individual services that represent certain business capabilities. Usually they are deployed separately and can also be versioned individually. Overall goal is that the complete business application will allow particular domain to achieve their business goals e.g. order management, accommodation management, etc.
Business application is

* Build on any runtime 
* Deployable to cloud with just single command 
* UI agnostic (doesn’t enforce any UI frameworks and let users to make their own choice)
* Configurable database profiles 
* Generated

Business application consists of (though are not restricted to have only one of each project types)

* data model project - shared data model between business assets and service 
* business assets (kjar) project - easily importable into workbench 
* service project - actual service with various capabilities

**Service project** is the one that is deployable but will in most of the cases include business assets and data model projects.

**Data model project** represents the common data structures that will be shared between service implementation and business assets. That enables proper encapsulation and promotes reuse and at the same time reduces shortcuts to make data model classes something more than they are - include too much of implementation into data models.

**Business assets project** represents your business logic as processes, cases, rules, decision tables and more.

Following are the maven archetype commands need to be used to generate different types of projects:

* Data model archetype

    ```
    mvn archetype:generate -B -DarchetypeGroupId=org.kie -DarchetypeArtifactId=kie-model-archetype -DarchetypeVersion=7.74.1.Final -DgroupId=com.company -DartifactId=business-application-model -Dversion=1.0-SNAPSHOT -Dpackage=com.company.model
    ```
This command creates a project which generates business-application-model-1.0-SNAPSHOT.jar

* Business assets project archetype

    ```
    mvn archetype:generate -B -DarchetypeGroupId=org.kie -DarchetypeArtifactId=kie-kjar-archetype -DarchetypeVersion=7.74.1.Final -DgroupId=com.company -DartifactId=business-application-kjar -Dversion=1.0-SNAPSHOT -Dpackage=com.company
    ```
This command creates a project which generates business-application-kjar-1.0-SNAPSHOT.jar

* Dynamic assets project archetype

    ```
    mvn archetype:generate -B -DarchetypeGroupId=org.kie -DarchetypeArtifactId=kie-kjar-archetype -DarchetypeVersion=7.74.1.Final -DcaseProject=true -DgroupId=com.company -DartifactId=business-application-kjar -Dversion=1.0-SNAPSHOT -Dpackage=com.company
    ```
This command creates a project which generates business-application-kjar-1.0-SNAPSHOT.jar

Service project archetype can be used based on the capabilities that are needed in the project. Capabilities essentially define the features that your business application will be equipped with. Available options are:

* Business automation(bpm) covers features for process management, case management, decision management and optimization. These will be by default configured in the service project of your business application. Although you can turn them off via configuration.

    ```
    mvn archetype:generate -B -DarchetypeGroupId=org.kie -DarchetypeArtifactId=kie-service-spring-boot-archetype -DarchetypeVersion=7.74.1.Final -DgroupId=com.company -DartifactId=business-application-service -Dversion=1.0-SNAPSHOT -Dpackage=com.company.service -DappType=bpm
    ```
* Decision management(brm) covers mainly decision and rules related features (backed by Drools project)

    ```
    mvn archetype:generate -B -DarchetypeGroupId=org.kie -DarchetypeArtifactId=kie-service-spring-boot-archetype -DarchetypeVersion=7.74.1.Final -DgroupId=com.company -DartifactId=business-application-service -Dversion=1.0-SNAPSHOT -Dpackage=com.company.service -DappType=brm
    ```
* Business optimization(planner) covers planning problems and solutions related features (backed by OptaPlanner project)

    ```
    mvn archetype:generate -B -DarchetypeGroupId=org.kie -DarchetypeArtifactId=kie-service-spring-boot-archetype -DarchetypeVersion=7.74.1.Final -DgroupId=com.company -DartifactId=business-application-service -Dversion=1.0-SNAPSHOT -Dpackage=com.company.service -DappType=planner
    ```
These commands create a project which generates business-application-service-1.0-SNAPSHOT.jar

## Build your first Business Application

To build your first business application,use the above mentioned maven archetype commands to generate a Data project,Business assets project and a Service project with desired capabilities.

It is recommended to generate all the three types of projects Data Model, Business assets and Service projects using the archetypes in same directory on your computer.

Once you have the application on your computer just follow these steps to have it up and running

* go to directory suffixed with -service 
* execute ```./launch.sh clean install``` for unix or ```launch.bat clean install``` for windows 
* once the boot has finished go to http://localhost:8090

## More examples
[Go to examples repository](https://github.com/business-applications)



