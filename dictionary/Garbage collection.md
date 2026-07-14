---
description: The JVM's automatic reclamation of heap objects that are no longer reachable from any live root.
---

Garbage collection is the process by which the [JVM](./JVM.md) frees memory on the [heap](./Heap.md) that a running program can no longer reach.
The criterion is reachability, not reference counting.
A collector starts from a set of roots - local variables in each [stack frame](./Stack%20frame.md), static [fields](./Field.md), JNI handles - and traces every [reference](./Reference.md) it can follow.
Anything not reached by that trace is garbage, regardless of how many pointers still point at it.
This is why two [objects](./Object.md) that reference each other but nothing else are both collectable: cycles are not a problem for a tracing collector.

Collection is not free and it is not fully deterministic.
`System.gc()` is a hint the JVM may ignore, and `finalize()` is deprecated and should not be relied on for cleanup; use [try-with-resources](./try-with-resources.md) for anything holding a file handle or socket.

The common belief that "you cannot leak in Java" is false.
The collector does exactly what you asked: it keeps anything still reachable.
If your code holds a [reference](./Reference.md) it no longer needs, that is a [memory leak](./Memory%20leak.md), and no collector will save you.
[Metaspace](./Metaspace.md), which holds [class](./Class.md) metadata, is collected on a separate schedule from the heap.

_Usage:_

"If I set the variable to null, does that force garbage collection?"

"No. It just removes one reference. The object is only collected once nothing reachable from a GC root points to it, and even then only when the collector next runs."
