---
description: A class or interface that names the exact set of types allowed to extend it, closing the hierarchy.
---

A sealed [class](./Class.md) or [interface](./Interface.md) restricts which other types may extend it, using a `permits` clause that lists them by name.
Every permitted subtype must itself be declared `final`, `sealed`, or `non-sealed`, so the hierarchy is closed at every level rather than only at the top.

This is the opposite trade from ordinary [inheritance](./Inheritance.md), which invites unknown subclasses, and from a plain [abstract class](./Abstract%20class.md), which the compiler cannot reason about exhaustively.
A sealed hierarchy says the set of cases is known and complete, and that knowledge is what the compiler exploits.
Given a [switch expression](./Switch%20expression.md) over a sealed type using [pattern matching](./Pattern%20matching.md), the compiler can prove the cases are exhaustive and drop the need for a `default`.
Add a new permitted subtype later and every switch that fails to handle it becomes a compile error - the case analysis is checked, not trusted.

```java
sealed interface Result permits Ok, Err {}
record Ok(String value) implements Result {}
record Err(Exception cause) implements Result {}
```

Pairing sealed types with [record](./Record.md) components gives a sum of products: a fixed set of alternatives, each holding named, [immutable](./Immutability.md) data.
Permitted subtypes must sit in the same module, or the same [package](./Package.md) in unnamed-module code, since the [JVM](./JVM.md) records the permitted list in the [bytecode](./Bytecode.md) and enforces it at link time.

_Usage:_

"Should I use an abstract class or a sealed interface for my result type?"

"Sealed, if the alternatives are fixed - you get exhaustive switches for free, and an abstract class gives you nothing the compiler can check."
