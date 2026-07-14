---
description: The per-call record holding a method's local variables, operand stack, and return address, pushed on a thread's call stack.
---

A stack frame is the block of memory the [JVM](./JVM.md) pushes each time a [method](./Method.md) is invoked and pops when it returns.

Each frame holds three things: an array of local variable slots (the parameters, `this` for instance methods, and any locals declared in the body), an operand stack that [bytecode](./Bytecode.md) instructions push and pop as they compute, and a reference to the constant pool of the owning [class](./Class.md).
Frame sizes are fixed at compile time, because the compiler already knows how many slots the method needs.

Every [thread](./Thread.md) gets its own call stack, so frames are never shared.
This is why locals need no synchronisation, while [objects](./Object.md) on the [heap](./Heap.md) do.
It is also why a frame's locals cannot be a [memory leak](./Memory%20leak.md): the frame disappears on return, and anything only reachable from it becomes eligible for [garbage collection](./Garbage%20collection.md).

The stack has a bounded size, set by `-Xss`.
Recursion that never reaches a base case pushes frames until it runs out, and the JVM throws `StackOverflowError`.
Mutually recursive `toString()` or `equals()` implementations between two objects that point at each other produce the same crash.

A [stack trace](./Stack%20trace.md) is just this stack, printed: one line per live frame, innermost first.
[Virtual threads](./Virtual%20thread.md) move their frames onto the heap when parked, which is why millions of them fit.

_Usage:_

"StackOverflowError with thousands of repeating lines in the trace."

"That is infinite recursion. The repeating block in the stack trace is the cycle - find the call in it that should have terminated."
