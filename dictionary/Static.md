---
description: A modifier meaning the member belongs to the class itself rather than to any instance of it.
---

`static` marks a [field](./Field.md), [method](./Method.md), or nested [class](./Class.md) as belonging to the class, not to an [object](./Object.md).
There is exactly one copy of a static field per class per [classloader](./Classloader.md), and it exists from the moment the class is initialized until the loader is discarded.
A static method has no `this`, so it cannot be overridden ([method overriding](./Method%20overriding.md) is dispatched on the runtime type of an instance); a subclass can only hide it.

Two consequences matter more than the syntax.

First, static state is shared across every [thread](./Thread.md) in the process.
A mutable static field touched concurrently is a [race condition](./Race%20condition.md) waiting to happen unless it is guarded by [synchronized](./synchronized.md), declared [volatile](./volatile.md), or made [immutable](./Immutability.md).
Static counters and lazily built static caches are where this usually bites.

Second, a static field is a garbage collection root.
Whatever it points at is reachable for the life of the class, which is why an unbounded static [Map](./Map.md) is the textbook [memory leak](./Memory%20leak.md) and never a candidate for [garbage collection](./Garbage%20collection.md).

```java
public class Ids {
    private static int next = 0;          // shared, unsafe
    public static int nextId() { return next++; }  // races
}
```

_Usage:_

"Can I just make the counter static so both handlers see it?"

"They will see it, but they will also race on it. Static means one shared slot across all threads, so use an AtomicInteger rather than a plain int."
