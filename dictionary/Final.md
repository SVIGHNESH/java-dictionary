---
description: A modifier meaning a binding cannot be reassigned, a method cannot be overridden, or a class cannot be extended.
---

`final` on a variable or [field](./Field.md) means the binding cannot be reassigned after it is set.
That is all it means.
It says nothing about the [object](./Object.md) the binding points at.

This is the distinction worth internalising: `final` constrains the [reference](./Reference.md), not the referent.
A `final List` can still have elements added to it, removed from it, and cleared out of it, because none of those operations reassign the variable.
Final is not [immutability](./Immutability.md); immutability is a property of the object's own state, and you get it by making the fields final *and* not exposing mutable internals.

```java
final List<String> names = new ArrayList<>();
names.add("ada");        // fine, no reassignment
names = new ArrayList<>(); // compile error
```

On a [method](./Method.md), `final` forbids [method overriding](./Method%20overriding.md); on a [class](./Class.md), it forbids [inheritance](./Inheritance.md), which is one way to make a class safe to treat as a value (see also [sealed class](./Sealed%20class.md) when you want a closed set of subtypes rather than none).
A final field also carries a memory-model guarantee: once a [constructor](./Constructor.md) completes, its final fields are visible to other [threads](./Thread.md) without extra synchronisation.
Variables captured by a [lambda](./Lambda.md) must be final or effectively final.

_Usage:_

"The field is final, so the config object is safe to share, right?"

"Only if the config is actually immutable. Final means nobody can point the field at a different object; it does not stop anyone calling setters on the one it points at."
