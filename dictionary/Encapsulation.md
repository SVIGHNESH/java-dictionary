---
description: Keeping a class's internal state private and exposing only the methods needed to use it.
---

Encapsulation is the practice of restricting direct access to a [class](./Class.md)'s internal [fields](./Field.md) and letting callers interact only through its [methods](./Method.md).
In Java this is enforced with access modifiers: `private` limits access to the declaring class, package-private to the [package](./Package.md), `protected` to subclasses, and `public` to everyone.
The point is not secrecy but the freedom to change internals later without breaking callers.

The most common way to break it is returning a mutable internal collection.
A getter that hands back the live [List](./List.md) lets any caller mutate the object's state behind its back, and it can trigger a [ConcurrentModificationException](./ConcurrentModificationException.md) in code that never asked for it.
Return an unmodifiable view or a copy instead.

```java
public List<Item> items() {
    return List.copyOf(this.items);   // caller cannot mutate mine
}
```

Declaring fields [final](./Final.md) and aiming at [immutability](./Immutability.md) removes the problem at the source, which is part of why a [record](./Record.md) is a good default for data carriers.
Note that a record's accessors still leak any mutable [reference](./Reference.md) they hold.
[Composition](./Composition.md) preserves encapsulation better than [inheritance](./Inheritance.md), which exposes protected internals to every subclass.

_Usage:_

"Callers keep mutating the list my getter returns. Should I document that they shouldn't?"

"Documentation is not encapsulation. Return List.copyOf and the problem stops existing."
