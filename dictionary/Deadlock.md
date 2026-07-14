---
description: A standstill in which two or more threads each hold a lock the other needs, so none of them can ever proceed.
---

Deadlock is the state where every [thread](./Thread.md) in a cycle is blocked waiting for a lock held by another thread in that same cycle.
Nothing times out, nothing throws; the threads simply stop forever.

The classic case is two locks taken in opposite orders.

```java
// Thread 1                  // Thread 2
synchronized (a) {           synchronized (b) {
  synchronized (b) { ... }     synchronized (a) { ... }
}                            }
```

If thread 1 acquires `a` and thread 2 acquires `b` before either takes its second lock, both wait on the other's monitor and neither will release.
This is not a [race condition](./Race%20condition.md) in the sense of a corrupted value - it is a liveness failure, and the [JVM](./JVM.md) will not rescue you.

The fix is a consistent global lock ordering: every thread acquires `a` before `b`, always.
With a fixed order no cycle can form.
Failing that, hold fewer locks, shorten the [synchronized](./synchronized.md) region, or use `ReentrantLock.tryLock` with a timeout so a thread can back off.
Sharing only [immutable](./Immutability.md) [objects](./Object.md) avoids locks entirely.
`jstack` will print a "Found one Java-level deadlock" section with the offending [stack traces](./Stack%20trace.md).

_Usage:_

"Two of our worker threads are just sitting there, zero CPU, no progress."

"Take a thread dump. If it is a deadlock, jstack names both locks, and the fix is almost always to pick one canonical order and acquire them that way everywhere."
