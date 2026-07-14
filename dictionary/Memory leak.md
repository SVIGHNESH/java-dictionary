---
description: In Java, memory held by objects that are still reachable but will never be used again, so the collector cannot reclaim them.
---

A memory leak in Java is unintentional reachability.
[Garbage collection](./Garbage%20collection.md) reclaims only what is unreachable, so any [object](./Object.md) you still hold a [reference](./Reference.md) to stays on the [heap](./Heap.md) forever, whether or not you ever touch it again.
The collector is not broken when this happens; it is doing precisely what your object graph tells it to do.

The classic case is an ever-growing [static](./Static.md) [Map](./Map.md) used as a cache with no eviction: it is rooted for the life of the [classloader](./Classloader.md), so every entry put in it is immortal.
The other classic is a listener or callback registered with a long-lived publisher and never deregistered, which pins the listener and everything it captures.
Long-lived [collections](./Collection%20framework.md), `ThreadLocal` values on pooled [threads](./Thread.md), and inner classes capturing an enclosing instance all leak the same way.

Symptoms are a heap that grows across load cycles and eventually `OutOfMemoryError`.
Diagnose with a heap dump and look for the dominator tree: something is holding what you thought was garbage.
Fixes are bounded caches, explicit deregistration, and weak references where a cache must not own its keys.

_Usage:_

"We use Java, so we can't have memory leaks, right?"

"You can. The collector frees unreachable objects, and a static map that grows forever is very much reachable. That is the most common leak we see."
