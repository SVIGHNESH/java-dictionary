---
description: A field modifier guaranteeing that reads and writes are visible across threads and not reordered - but not that they are atomic.
---

`volatile` is a modifier on a [field](./Field.md) that forces every read to come from main memory and every write to go to main memory, rather than sitting in a CPU cache or register.
It also establishes an ordering edge: writes made by a [thread](./Thread.md) before it writes a volatile field are visible to any thread that subsequently reads that field.
Without it, the [JVM](./JVM.md) and the CPU are free to cache and reorder, and one thread may simply never observe another's update.

The critical point, and the most common misconception in Java concurrency: **volatile does not give you atomicity.**
`count++` is a read, an add, and a write.
Making `count` volatile makes each of those three steps visible, but does nothing to stop another thread interleaving between them.
A volatile counter incremented from two threads is still a [race condition](./Race%20condition.md) and will lose updates.

For atomic compound actions, use [synchronized](./synchronized.md) or an `AtomicInteger`.
`volatile` is right for a single write that others must see - a `boolean running` flag, or safely publishing a [reference](./Reference.md) to an [immutable](./Immutability.md) [object](./Object.md).

_Usage:_

"I made the counter volatile and it still loses increments. Why?"

"Because volatile only guarantees visibility and ordering, not atomicity. `count++` is three operations and two threads can interleave inside it. You want AtomicInteger or a synchronized block."
