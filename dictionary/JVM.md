---
description: The runtime that loads class files, verifies and executes bytecode, and manages memory for a running Java program.
---

The JVM (Java Virtual Machine) is the process that actually runs a Java program.
It is defined by a specification, not by a single implementation, and it accepts one input format: [bytecode](./Bytecode.md) packaged in `.class` files.

The JVM is an abstract machine with its own instruction set, its own type system, and its own memory model.
A [classloader](./Classloader.md) pulls a class in, the verifier checks its bytecode is well formed and type safe, and the interpreter starts executing it.
Hot code is then handed to [JIT compilation](./JIT%20compilation.md) and turned into native machine code.
Memory is split into regions the JVM owns: the [heap](./Heap.md) for [objects](./Object.md), a per-thread stack of [stack frames](./Stack%20frame.md) for [method](./Method.md) calls, and [metaspace](./Metaspace.md) for class metadata.
[Garbage collection](./Garbage%20collection.md) reclaims heap objects that are no longer reachable through any [reference](./Reference.md).

This is the mechanism behind portability.
The compiler targets the JVM instruction set rather than an x86 or ARM instruction set, so the same `.class` file runs anywhere a conforming JVM exists.
The JVM, not the program, is the part that is ported.

Anything that emits valid bytecode can run here, which is why Kotlin and Scala are JVM languages.

_Usage:_

"Do I need to recompile my jar for the ARM servers?"

"No. The bytecode is the same everywhere. Only the JVM itself is platform specific, and there is an ARM build of it."
