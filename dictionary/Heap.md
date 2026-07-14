---
description: The JVM memory region where all objects and arrays live, shared across threads and reclaimed by garbage collection.
---

The heap is the region of [JVM](./JVM.md) memory in which every [object](./Object.md) and array is allocated.
`new` allocates here.
Nothing else does.

The heap is shared by all [threads](./Thread.md), unlike a [stack frame](./Stack%20frame.md), which is private to one thread and dies when its [method](./Method.md) returns.
A local variable of a [reference type](./Reference%20type.md) lives in a frame, but it only holds a [reference](./Reference.md) pointing into the heap.
A local of a [primitive type](./Primitive%20type.md) holds its value directly, which is what [autoboxing](./Autoboxing.md) undoes when it moves an `int` onto the heap as an `Integer`.

Heap memory is not freed explicitly.
[Garbage collection](./Garbage%20collection.md) periodically finds objects that are no longer reachable from any live root and reclaims them.
Most collectors split the heap generationally, because most objects die young: new objects go into an eden space, survivors are promoted, and long-lived objects end up in an old generation that is collected less often.

Class metadata does not live here; it lives in [metaspace](./Metaspace.md).

The failure mode is `OutOfMemoryError: Java heap space`, thrown when the collector cannot free enough room to satisfy an allocation.
It usually means a [memory leak](./Memory%20leak.md), an unbounded cache or [collection](./Collection%20framework.md) that keeps objects reachable forever, rather than a heap that is merely too small.

_Usage:_

"We keep hitting OutOfMemoryError. Should I just raise -Xmx?"

"Take a heap dump first. If something is retaining objects, a bigger heap only delays the crash."
