---
description: An abstraction that accepts tasks and runs them on threads it manages, decoupling task submission from thread lifecycle.
---

An `ExecutorService` is an [interface](./Interface.md) that takes a submitted task - a `Runnable` or a `Callable`, usually written as a [lambda](./Lambda.md) - and runs it on a [thread](./Thread.md) it owns.
The point is decoupling: your code says *what* work to do, and the executor decides *which* thread does it and when.
You stop calling `new Thread(...).start()` and stop paying to create a platform thread per task.

`submit` returns a `Future`, a handle you can block on for the result or cancel.
`Executors` provides the usual factories: a fixed pool, a cached pool, a single-threaded executor, a scheduled one.
A bounded pool also gives you back-pressure, since work queues rather than spawning threads without limit.

You must shut it down.
The default thread factory creates non-daemon threads, so an executor you never stop will keep the [JVM](./JVM.md) alive after `main` returns.
Call `shutdown()` to stop accepting work and drain the queue, then `awaitTermination`, and `shutdownNow` if you must interrupt.
`Executors.newVirtualThreadPerTaskExecutor()` backs each task with a [virtual thread](./Virtual%20thread.md) instead of pooling.
Tasks still share state, so they can still hit a [race condition](./Race%20condition.md) or a [deadlock](./Deadlock.md).

_Usage:_

"My program finishes its work but the process never exits."

"You probably never shut down the executor service. Its threads are non-daemon, so the JVM waits on them. Call shutdown() in a finally block, or use try-with-resources on JDK 19+."
