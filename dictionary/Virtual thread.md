---
description: A lightweight thread scheduled by the JVM rather than the OS, finalized in JDK 21, making millions of concurrent threads practical.
---

A virtual thread is a [thread](./Thread.md) whose stack lives on the [heap](./Heap.md) and whose scheduling is done by the [JVM](./JVM.md), not the operating system.
Delivered by Project Loom and finalized in [JDK](./JDK.md) 21, it implements the same `Thread` API - you still get a [stack trace](./Stack%20trace.md), still write blocking code - but it costs a few hundred bytes instead of a megabyte of OS stack.

When a virtual thread blocks on I/O, the JVM unmounts it from its underlying *carrier* platform thread and parks its stack, freeing the carrier to run another virtual thread.
Blocking becomes cheap, so the whole reason for pooling disappears: with virtual threads you create one per task, typically via `Executors.newVirtualThreadPerTaskExecutor()`, and a bounded [executor service](./Executor%20service.md) pool becomes the wrong shape.

The real gotcha is *pinning*.
On earlier releases, a virtual thread that blocks inside a [synchronized](./synchronized.md) block cannot unmount; it holds its carrier hostage, and enough pinned threads starve the scheduler.
The workaround is `ReentrantLock`, which does not pin.
JDK 24 largely fixed this, but on 21 it matters.
Virtual threads change the cost of concurrency, not its semantics: a [race condition](./Race%20condition.md) and [deadlock](./Deadlock.md) are exactly as possible, and [immutability](./Immutability.md) is still the cleanest defence.

_Usage:_

"We moved to virtual threads and throughput barely improved."

"Check for pinning. If your hot path blocks inside a synchronized block, the virtual thread cannot unmount from its carrier. Swap those monitors for ReentrantLock and measure again."
