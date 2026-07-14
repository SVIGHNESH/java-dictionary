---
description: The native memory region where the JVM stores class metadata, sitting outside the heap.
---

Metaspace is the area of native memory in which the [JVM](./JVM.md) keeps [class](./Class.md) metadata: the runtime representation of a loaded type, its [method](./Method.md) and [field](./Field.md) descriptors, the constant pool, and the [bytecode](./Bytecode.md) itself.
It lives outside the [heap](./Heap.md), so it is not sized by `-Xmx`; it grows into native memory and is bounded by `-XX:MaxMetaspaceSize` if you set one.
It replaced PermGen in Java 8, which is why `OutOfMemoryError: PermGen space` became `OutOfMemoryError: Metaspace`.

Your [objects](./Object.md) are on the heap; the description of their classes is in Metaspace.
Metadata is reclaimed by [garbage collection](./Garbage%20collection.md), but at the granularity of a whole [classloader](./Classloader.md): all classes a loader defined are freed together, and only when the loader itself becomes unreachable.

That granularity is the source of the usual failure.
Applications that repeatedly load classes - hot redeploys in an app server, dynamic proxies, scripting engines, heavy reflective frameworks - can pin loaders alive through a single stray [reference](./Reference.md), producing a classloader [memory leak](./Memory%20leak.md) that exhausts Metaspace while the heap looks perfectly healthy.

_Usage:_

"We're getting OutOfMemoryError: Metaspace, but heap usage is flat. Should I raise -Xmx?"

"No, that only sizes the heap. Metaspace holds class metadata separately, so something is loading classes without releasing the old classloaders. Look for a leaked classloader on redeploy."
