---
description: A container that holds either one value or nothing, used as a return type to make absence explicit in the signature.
---

`Optional<T>` is a wrapper that either holds a value or is empty.
Its purpose is documentation enforced by the type system: a [method](./Method.md) returning `Optional<User>` states in its signature that no user may exist, so the caller cannot silently forget the case the way they can with a bare `null`.

It is a return type, not a [field](./Field.md) type.
Do not declare fields, method parameters, or collection elements as `Optional`, and do not put one in a [List](./List.md) or as a [Map](./Map.md) value; the map already expresses absence by returning `null` from `get`, and wrapping adds an allocation and an indirection for nothing.

The value comes from the methods that consume it: `orElse`, `orElseGet`, `orElseThrow`, `map`, `filter`, and `ifPresent`.
Calling `.get()` without checking is the anti-pattern, because an empty Optional then throws `NoSuchElementException`, which just relocates the [NullPointerException](./NullPointerException.md) you were trying to avoid.

```java
String city = repo.findUser(id)          // Optional<User>
    .map(User::address)
    .map(Address::city)
    .orElse("unknown");
```

Terminal operations on a [Stream](./Stream.md) such as `findFirst` and `max` return one, and it composes with [lambdas](./Lambda.md) the same way.

_Usage:_

"Is `optional.get()` fine if I already called `isPresent()`?"

"It works, but it is a longer way of writing `orElseThrow()` or `orElse(default)`. Prefer `map`/`orElse`, so the empty case stays impossible to forget rather than merely checked this once."
