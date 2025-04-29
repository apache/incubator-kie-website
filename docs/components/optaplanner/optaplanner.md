---
id: optaplanner
title: Optaplanner
sidebar_position: 0
---

# Solve planning and scheduling problems with OptaPlanner

A fast, easy-to-use, open source AI constraint solver for software developers

# What can OptaPlanner do?

OptaPlanner optimizes plans and schedules with *hard constraints* and *soft constraints*.
It **reduces costs** substantially, improves **service quality**, **fulfills employee wishes** and **lowers carbon emissions**.


- Vehicle routing
  - Quick router for a fleet of vehicles.
- Employee rostering
  - Assign shifts to employees by skills and availability.
- Maintenance scheduling
  - Timely upkeep of machinery and equipment.
- Conference scheduling
  - Schedule speakers and talks by availability and topic.
- School timetabling
  - Compact schedules for teachers and students.
- Task assigment
  - Assign tasks by priority, skills and affinity.
- Cloud optimization
  - Bin packaging and defragmentation of cloud resources.
- Job shop scheduling
  - Reduce makespan for assembly lines.

# What is OptaPlanner?

OptaPlanner is a Open Source Java™ AI constraint solver to optimize conference schedules.

OptaPlanner is a lightweight, embeddable planning engine. It enables everyday Java™ programmers to solve optimization problems efficiently. It is also compatible with other JVM languages (such as Kotlin and Scala). Constraints apply on plain domain objects and can call existing code. There’s no need to input constraints as mathematical equations. Under the hood, OptaPlanner combines sophisticated Artificial Intelligence optimization algorithms (such as Tabu Search, Simulated Annealing, Late Acceptance and other metaheuristics) with very efficient score calculation and other state-of-the-art constraint solving techniques.

OptaPlanner is open source software, released under the Apache License. It is written in 100% pure Java™, runs on any JVM and is available also in the Maven Central repository.


# Modern mathematical optimization
OptaPlanner is a lightweight, embeddable planning engine. It enables everyday programmers to solve optimization problems efficiently. Constraints apply on plain domain objects and can call existing code. It is Object Oriented Programming (OOP) and Functional Programming (FP) friendly. There’s no need to input constraints as mathematical equations.
OptaPlanner supports 
- **Continuous planning** to weekly publish the schedule, 3 weeks before execution 
- **Non-disruptive replanning** for changes to an already published schedule 
- **Real-time planning** to react on real-time disruptions in the plan within milliseconds 
- **Overconstrained planning** when there are too few resources to cover all the work 
- **Pinning** so the user is still in control over the schedule

Under the hood, OptaPlanner combines sophisticated Artificial Intelligence optimization algorithms (such as Tabu Search, Simulated Annealing, Late Acceptance and other metaheuristics) with very efficient score calculation and other state-of-the-art constraint solving techniques for NP-complete or NP-hard problems.

# Compatibility

Compatibility
OptaPlanner works directly from:
- Java 
- Kotlin 
- Scala 
- Python (experimental)

OptaPlanner integrates seamlessly with:

- Quarkus 
- Spring Boot

OptaPlanner runs on:

- Kubernetes and OpenShift 
- All major clouds

OptaPlanner is open source software, released under the Apache License.

# Code example
To optimize a problem from Java™ code, add the <code>optaplanner-core</code> jar and call <code>Solver.solve()</code>:

```
    SolverFactory<MyRoster> factory = SolverFactory.create(...);
  
    // My domain specific class as input
    MyRoster problem = ...;

    Solver<MyRoster> solver = factory.buildSolver();
    // My domain specific class as output
    MyRoster solution = solver.solve(problem);

    for (MyShift shift : solution.getShifts()) {
       // Each shift is now assigned to an employee
       assertNotNull(shift.getEmployee());
    }
```
