---
description: A lazy, single-use pipeline of operations over a sequence of elements, terminated by an operation that produces a result.
---

A `Stream` is a pipeline that carries elements through a chain of operations and produces a result.
It is not a collection: it stores nothing, it does not let you index into it, and it does not modify its source.
You get one from a [collection](./Collection%20framework.md) with `list.stream()`, and you end it with a terminal operation such as `collect`, `forEach`, `reduce`, or `count`.

Two properties define its behaviour.
It is lazy: intermediate operations like `filter`, `map`, and `sorted` build the pipeline but run nothing.
Without a terminal operation, no element is ever touched.
It is single-use: once consumed, the stream is spent, and reusing it throws `IllegalStateException`.
If you need the data twice, keep the source [List](./List.md) and open a new stream.

The operations take [lambdas](./Lambda.md) or [method references](./Method%20reference.md), which are instances of a [functional interface](./Functional%20interface.md) such as `Predicate` or `Function`.
`findFirst` and `max` return an [Optional](./Optional.md), since the pipeline may be empty.
`Collectors.toMap` builds a [Map](./Map.md), and depends on the key type's [equals and hashCode](./equals%20and%20hashCode.md).

_Usage:_

"I built a stream with a couple of `filter` calls and nothing happened. Where did my elements go?"

"Nowhere, because streams are lazy. `filter` only records what to do. Add a terminal operation such as `.toList()` or `.count()` and the pipeline actually runs."
