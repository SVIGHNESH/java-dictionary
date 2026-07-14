---
description: A keyword that acquires an object's monitor lock, giving both mutual exclusion and memory visibility to the code it guards.
---

`synchronized` marks a block or a [method](./Method.md) as requiring the monitor lock of some [object](./Object.md) before it may run.
Only one [thread](./Thread.md) can hold a given monitor at a time, so the guarded code runs under mutual exclusion.
It also carries memory visibility: everything a thread wrote before releasing a monitor is visible to the next thread that acquires the same monitor.
This second guarantee is why `synchronized` subsumes [volatile](./volatile.md) rather than competing with it.

The lock is on an object, not on the code.
A `synchronized` instance method locks `this`; a `synchronized` [static](./Static.md) method locks the `Class` object.
Two threads calling different synchronized methods of the same instance still contend, because it is the same monitor.

```java
private final Object lock = new Object();
private int count;

void increment() {
    synchronized (lock) { count++; }   // now atomic AND visible
}
```

Prefer a private [final](./Final.md) lock object over locking `this`, so outside code cannot lock you out.
Holding two monitors at once invites [deadlock](./Deadlock.md).
Under [virtual threads](./Virtual%20thread.md), blocking inside a `synchronized` block can pin the carrier thread.

_Usage:_

"Do I need volatile as well if the field is only touched inside synchronized blocks?"

"No. Releasing the monitor publishes your writes and acquiring it sees them, so synchronized already covers visibility."
