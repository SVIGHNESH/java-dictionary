---
description: The snapshot of the call stack captured when an exception is constructed, listing the frames from throw site outward.
---

A stack trace is the list of [stack frames](./Stack%20frame.md) captured at the moment an [exception](./Exception.md) object is constructed - not when it is thrown or caught.
Read it top-down.
The first line is the exception's type and message, the next line is the [method](./Method.md) that threw, and each line below is its caller, down to `Thread.run` or `main`.

The part that actually matters is usually further down.
When an exception wraps another, the printout continues with `Caused by:` and the original trace.
The last `Caused by:` block is the root cause - the deepest one is what really broke.
Everything above it is [packages](./Package.md) re-throwing.
Frames from your own code, rather than framework or [JDK](./JDK.md) code, are the ones you can act on.

The single most destructive thing you can do to a trace is swallow it.
An empty `catch` block, or one that logs `e.getMessage()` without the exception object, throws away the frames permanently.
There is no recovering them; the failure just reappears somewhere unrelated with no history.
Always log or re-throw the exception itself.

`... 23 more` means those frames are identical to the enclosing trace and were elided.

_Usage:_

"There are eighty lines of Spring proxy frames in this trace. Where do I even start?"

"Skip to the bottom-most `Caused by:` and find the first frame in your own package. That is your bug."
