---
description: A bug where the correctness of a program depends on the unsynchronized timing of two or more threads.
---

A race condition occurs when two [threads](./Thread.md) access shared mutable state concurrently, at least one of them writes, and the result depends on which one happens to get there first.
The program is not wrong on every run - it is wrong on *some* interleavings, which is what makes races so hard to reproduce and so easy to ship.

The archetype is check-then-act:

```java
if (map.get(key) == null) {   // thread A checks
    map.put(key, compute());  // thread B slipped in here
}
```

Read-modify-write is the same shape: `count++` on a plain or even a [volatile](./volatile.md) [field](./Field.md) reads, adds, and stores, and another thread can interleave between the steps.
Volatility fixes visibility, not the interleaving.

There are three cures.
Make the compound action atomic with [synchronized](./synchronized.md) or an atomic class.
Do not share the state at all - confine it to one thread.
Or make it [immutable](./Immutability.md), since state that never changes cannot be raced on.
The related [ConcurrentModificationException](./ConcurrentModificationException.md) is a *lucky* race: the [collection](./Collection%20framework.md) noticed and failed fast rather than silently corrupting.

_Usage:_

"It passes locally and fails once a week in production."

"That smells like a race condition. Find the shared mutable field, check whether every read-modify-write on it is actually atomic, and lock or make it immutable."
