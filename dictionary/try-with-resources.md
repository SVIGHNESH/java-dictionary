---
description: A try statement that declares resources and closes them automatically, in reverse order, when the block exits.
---

try-with-resources is the form of `try` that declares one or more resources in parentheses and guarantees they are closed when the block exits, whether normally or by [exception](./Exception.md).
Any [object](./Object.md) whose [class](./Class.md) implements `AutoCloseable` qualifies.
Resources are closed in reverse declaration order, before any `catch` or `finally` runs.

```java
try (var in = Files.newInputStream(path);
     var out = Files.newOutputStream(target)) {
    in.transferTo(out);
}
```

Its predecessor was the `finally` block, and it was error-prone in a specific way.
If the body threw and `close()` also threw, the exception from `close()` replaced the real one - you lost the [stack trace](./Stack%20trace.md) that explained the actual failure and were left staring at a socket timeout on cleanup.
Nesting two resources correctly in `finally` required a null check and a nested try, and almost nobody wrote it right.

try-with-resources inverts this.
The body's exception wins, and anything thrown by `close()` is attached as a suppressed exception, retrievable via `getSuppressed()` and printed under `Suppressed:` in the trace.
Note that [garbage collection](./Garbage%20collection.md) does not close file handles or sockets, so this is the only deterministic release you get.

_Usage:_

"Do I still need a `finally` to close the connection?"

"No. Declare it in the try-with-resources header and it closes on every path out of the block, including a thrown exception."
