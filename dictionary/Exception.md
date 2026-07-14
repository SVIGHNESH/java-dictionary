---
description: An object representing an abnormal condition that interrupts normal control flow and propagates up the call stack until caught.
---

An exception is an [object](./Object.md) thrown when a [method](./Method.md) cannot complete its job normally.
Throwing one unwinds the call stack, discarding [stack frames](./Stack%20frame.md) one by one until some enclosing `catch` block matches the exception's type, or until the [thread](./Thread.md) dies and the runtime prints a [stack trace](./Stack%20trace.md).

Every exception is a [class](./Class.md) in a hierarchy rooted at `Throwable`.
Below it sit `Error` (problems the application is not expected to recover from, like running out of [heap](./Heap.md)) and `Exception`.
Under `Exception`, the [JVM](./JVM.md) draws its one structural distinction: everything descending from `RuntimeException` is an [unchecked exception](./Unchecked%20exception.md), and everything else is a [checked exception](./Checked%20exception.md) that the compiler forces you to declare or handle.

Exceptions carry a message, an optional cause, and the stack snapshot taken at construction time.
The cause is what lets you wrap a low-level failure in a domain-level one without losing the original.
Resource cleanup during unwinding is what [try-with-resources](./try-with-resources.md) exists to make correct.

_Usage:_

"Should I define my own exception type or reuse `IllegalArgumentException`?"

"Define your own if callers might reasonably want to catch it specifically. If nobody will ever branch on it, a standard exception with a good message is fine."
