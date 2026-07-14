---
description: An independent path of execution within a JVM process, with its own stack but sharing the heap with all other threads.
---

A thread is a single sequential flow of control that the [JVM](./JVM.md) can run concurrently with other such flows.
Each thread gets its own call stack, so every [stack frame](./Stack%20frame.md) and local variable it holds is private to it.
Everything on the [heap](./Heap.md) - every [object](./Object.md), every non-local [field](./Field.md) - is shared.
That split is the whole source of concurrency's difficulty: shared mutable state read and written by more than one thread, with no coordination, is a [race condition](./Race%20condition.md).

The classic Java thread is a *platform* thread, and it is a thin wrapper over an operating system thread.
It is expensive.
The OS reserves stack space for it, conventionally around 1MB, and the kernel schedules it.
You can afford thousands, not millions, which is why the standard advice was never to create a thread per request but to pool them behind an [executor service](./Executor%20service.md).
That cost is precisely what [virtual threads](./Virtual%20thread.md) exist to remove.

To make sharing safe, you coordinate: [synchronized](./synchronized.md) for mutual exclusion, [volatile](./volatile.md) for visibility, or best of all [immutability](./Immutability.md), which needs no coordination at all.

_Usage:_

"Can I just spin up a thread per incoming connection?"

"With platform threads, no - each one costs an OS thread and about a megabyte of stack, so you will fall over well before ten thousand connections. Pool them, or switch to virtual threads."
