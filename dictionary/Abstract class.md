---
description: A class declared abstract that cannot be instantiated and may declare methods without bodies for subclasses to implement.
---

An abstract class is a [class](./Class.md) marked `abstract`, which means it cannot be instantiated directly.
It may declare abstract [methods](./Method.md) that have no body and must be implemented by a concrete subclass, and it may also carry ordinary methods, [fields](./Field.md), and a [constructor](./Constructor.md) that subclasses call through `super(...)`.
That mutable state and the constructor are the main things separating it from an [interface](./Interface.md).

Use an abstract class when subclasses genuinely share state and a partial implementation, such as a template method that fixes an algorithm's skeleton and leaves specific steps to [method overriding](./Method%20overriding.md).
Because it participates in single [inheritance](./Inheritance.md), a class can extend only one, so an abstract class in a public API forecloses the extension point for everyone downstream.
It also carries the fragile base class risk in full: any abstract class calling its own overridable methods is coupling itself to subclass behaviour.

Prefer an interface for a pure contract, and reach for an abstract class only when shared state earns it.
A [sealed class](./Sealed%20class.md) is often the better shape when the set of subtypes is closed and you want exhaustive [pattern matching](./Pattern%20matching.md) rather than open [polymorphism](./Polymorphism.md).

_Usage:_

"Abstract class or interface for my new Exporter type?"

"Interface, unless the exporters share real state. You get more implementation freedom, and default methods cover the shared logic."
