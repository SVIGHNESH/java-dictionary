---
description: The component that finds a class file by name, loads its bytes, and defines the resulting type in the JVM.
---

A classloader is the [JVM](./JVM.md) subsystem responsible for turning a class name into a live type.
Loading is lazy: a [class](./Class.md) is loaded the first time it is actually needed, not at startup.

Classloaders form a delegation chain.
The application classloader searches the classpath, but before searching it asks its parent, which asks its parent, up to the bootstrap loader that owns `java.lang` and the rest of the platform.
Only if every ancestor fails does the child look itself.
This ordering means application code cannot replace `java.lang.String` by putting a rival class earlier on the classpath.

A class's runtime identity is its fully qualified name *plus* its defining classloader.
Two loaders that both load `com.acme.Config` define two unrelated types, and assigning one to the other fails with a `ClassCastException` naming the same class on both sides.

Failures split into two:

- `ClassNotFoundException` - something asked for a class by name and no loader could find it. The jar is missing from the classpath.
- `NoClassDefFoundError` - the class was found at compile time but is absent or unloadable now, or its [static](./Static.md) initialiser threw earlier.

Loaded class metadata lives in [metaspace](./Metaspace.md), not the [heap](./Heap.md).
Servers and plugin systems use one loader per deployed unit so applications can be unloaded and reloaded independently.

_Usage:_

"I get NoClassDefFoundError but the class is right there in the jar."

"Check whether its static initialiser blew up on first use. After that the class is marked failed and you get NoClassDefFoundError forever."
