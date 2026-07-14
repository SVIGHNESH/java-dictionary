---
description: An exception descending from RuntimeException or Error that the compiler does not require you to catch or declare.
---

An unchecked exception is an [exception](./Exception.md) whose [class](./Class.md) descends from `RuntimeException` or `Error`.
The compiler does not track it: you may throw one from any [method](./Method.md) without a `throws` clause, and callers are never forced to catch it.
[NullPointerException](./NullPointerException.md), `IllegalArgumentException`, `IllegalStateException`, and [ConcurrentModificationException](./ConcurrentModificationException.md) are all unchecked.

The conventional line is that unchecked exceptions signal programming errors - a broken precondition, a bug in the calling code - while [checked exceptions](./Checked%20exception.md) signal recoverable environmental failures.
That line is blurrier in practice than in the textbook, and plenty of well-regarded APIs use unchecked exceptions for everything.

The real tradeoff is honesty versus noise.
Unchecked exceptions keep signatures clean and let a failure propagate untouched to a single top-level handler, which is usually where it should be handled anyway.
The cost is that they are invisible in the API: nothing in the signature tells you a call can fail, so you find out from the [stack trace](./Stack%20trace.md) in production.
A `@throws` line in the Javadoc is the only compensation available, and it is not enforced by anything.
[try-with-resources](./try-with-resources.md) still cleans up correctly when one propagates, since it does not care what type unwound the [stack frame](./Stack%20frame.md).

_Usage:_

"Should this validation failure be checked or unchecked?"

"Unchecked. If the caller passed a negative price, that is a bug in their code, not a condition they can retry out of."
