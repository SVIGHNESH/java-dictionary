---
description: An exception the compiler forces callers to either catch or declare in the method's throws clause.
---

A checked exception is any [exception](./Exception.md) that does not descend from `RuntimeException` or `Error`.
The compiler enforces a rule about it: if a [method](./Method.md) can throw one, it must say so with `throws`, and every caller must either catch it or declare it in turn.
`IOException` and `SQLException` are the canonical examples.

The intent was to make recoverable failures visible in the type signature, so that an API's failure modes are as explicit as its parameters.
The tradeoff is that `throws` clauses propagate.
A checked exception thrown four layers down forces a signature change in all four layers, and that pressure is the direct cause of the swallowed `catch (Exception e) {}` block: it is the fastest way to make the compiler stop complaining, and it destroys the [stack trace](./Stack%20trace.md) in the process.

The same pressure is why [lambda](./Lambda.md) bodies and [stream](./Stream.md) pipelines are awkward with checked exceptions - the standard [functional interfaces](./Functional%20interface.md) do not declare `throws`, so you must catch and wrap inside the lambda.
Most modern Java libraries favour [unchecked exceptions](./Unchecked%20exception.md) for this reason.

_Usage:_

"Why does this compile fine as a `RuntimeException` but not as an `IOException`?"

"Because `IOException` is a checked exception. The compiler makes you handle it or declare it; nothing checks a runtime one."
