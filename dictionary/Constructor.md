---
description: A special class member that initialises a new object; it has the class's name and no return type.
---

A constructor initialises a newly allocated [object](./Object.md).
It is declared with the name of its [class](./Class.md) and no return type, and it runs after memory is allocated but before the `new` expression yields a [reference](./Reference.md).
A class with no explicit constructor gets a no-argument default one; declare any constructor and that default disappears.

The first statement of a constructor is a call to another constructor: `this(...)` for overload chaining, or `super(...)` for the superclass.
If you write neither, the compiler inserts `super()`, so [inheritance](./Inheritance.md) means the whole chain up to `java.lang.Object` runs before your own body does.
That ordering is behind a real trap: if a superclass constructor calls an overridable [method](./Method.md), [method overriding](./Method%20overriding.md) sends the call to the subclass while the subclass's [final](./Final.md) [fields](./Field.md) are still at their defaults, so the override sees `null` or zero.

Constructors are where final fields get their one assignment, which makes them the enforcement point for [immutability](./Immutability.md).
A `private` constructor blocks instantiation from outside the [package](./Package.md), the usual way to force a static factory.
A [record](./Record.md) generates a canonical constructor from its components.

_Usage:_

"My subclass field is null inside a method the parent constructor calls."

"The parent constructor runs before the subclass initialisers, so the overridden method fires before your field is assigned; never call an overridable method from a constructor."
