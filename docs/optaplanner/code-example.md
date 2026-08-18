---
id: code-example
title: Code example
sidebar_position: 4
---

To optimize a problem from Java™ code, add the `optaplanner-core` jar and call
`Solver.solve()`:

```java
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
