---
description: Building a class from other objects held as fields and delegating to them, rather than extending a superclass.
---

Composition is building a [class](./Class.md) by holding other [objects](./Object.md) as [fields](./Field.md) and delegating work to them, instead of acquiring behaviour through [inheritance](./Inheritance.md).
The composed object is an implementation detail: callers never see it unless you choose to expose it, which keeps [encapsulation](./Encapsulation.md) intact.

Prefer composition over inheritance.
The reason is concrete, not stylistic.
A subclass is coupled to its superclass's internal call sequence, so a superclass change can break it - the fragile base class problem - and the subclass inherits every public [method](./Method.md) of the parent whether or not it makes sense.
A wrapper inherits nothing it did not ask for and can be re-pointed at a different delegate at runtime.

```java
final class CountingList {
    private final List<String> items = new ArrayList<>();
    void add(String s) { count++; items.add(s); }
}
```

The cost is that delegating methods must be written out, and the wrapper does not become a subtype of the delegate.
Where you still need substitutability, implement a shared [interface](./Interface.md) and get [polymorphism](./Polymorphism.md) that way.
Holding the delegate [final](./Final.md) and assigning it in the [constructor](./Constructor.md) is the usual arrangement, and a [record](./Record.md) can carry the components when the wrapper is just data.

_Usage:_

"I want to add logging to the repository. Extend it?"

"Use composition. Implement the same interface, hold the real repository as a field, log and delegate. No subclass, no coupling to its internals."
