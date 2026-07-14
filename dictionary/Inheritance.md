---
description: A mechanism where one class derives fields and methods from another, using the extends keyword.
---

Inheritance lets a [class](./Class.md) declare another class as its superclass with `extends`, inheriting that class's [methods](./Method.md) and non-private [fields](./Field.md).
Java allows only single inheritance of classes, though a class may implement many an [interface](./Interface.md).
A subclass [constructor](./Constructor.md) always runs the superclass constructor first, implicitly or via `super(...)`.
Inherited methods can be replaced through [method overriding](./Method%20overriding.md), which is what makes runtime [polymorphism](./Polymorphism.md) work.

The standard failure mode is the fragile base class.
Because a subclass depends on the superclass's internal call sequence, a harmless-looking change upstream - a superclass method now calling another overridable method - can silently break every subclass.
Subclasses also inherit the whole surface of their parent, including methods that make no sense for them, which weakens [encapsulation](./Encapsulation.md).

Inheritance is the right tool when the subtype genuinely substitutes for the supertype in every context, usually alongside an [abstract class](./Abstract%20class.md).
When you only want to reuse behaviour, [composition](./Composition.md) is the safer arrangement.
Marking a class [final](./Final.md) forbids extension, which is a deliberate design statement rather than an oversight.

_Usage:_

"Should I extend ArrayList to add a counting behaviour?"

"No. Inheritance would expose every List method you don't control, and addAll calls add internally, so your counts would double. Wrap the list instead."
