---
description: A reference type declaring method signatures that implementing classes must provide, with no instance state.
---

An interface is a [reference type](./Reference%20type.md) that declares [method](./Method.md) signatures a [class](./Class.md) promises to provide when it says `implements`.
It holds no instance state: its [fields](./Field.md) are implicitly `public static final`, and it has no [constructor](./Constructor.md).
A class may implement any number of interfaces, so an interface is the usual way to get [polymorphism](./Polymorphism.md) across otherwise unrelated types without spending the single [inheritance](./Inheritance.md) slot on an [abstract class](./Abstract%20class.md).

Since Java 8 an interface may carry `default` and [static](./Static.md) methods, which is how `List` gained `sort` without breaking existing implementors.
Default methods reintroduce a small diamond problem: if two interfaces supply the same default method, the implementing class must override it and choose, usually with `Interface.super.method()`.
Java rejects the ambiguity at compile time rather than picking silently.

An interface with exactly one abstract method is a [functional interface](./Functional%20interface.md), and can be implemented by a [lambda](./Lambda.md) or a [method reference](./Method%20reference.md).
Interfaces are the natural collaborator for [composition](./Composition.md), since you can hold a delegate by contract rather than by concrete class.

_Usage:_

"Both interfaces I implement define a default log() method and it won't compile."

"Java refuses to guess. Override log() in your class and delegate to whichever one you want with Auditable.super.log()."
