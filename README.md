# The Java Dictionary

The vocabulary of the Java language and the JVM, mapped into an interactive 3D knowledge graph.

Modelled on [The AI Coding Dictionary](https://www.aicodingdictionary.com/) by aihero.dev, and built the
same way it is: the markdown links between entries are the only source of the graph.

## The idea

There is no `nodes.json` and no `edges.json` in this repo. There is a folder of markdown.

```markdown
---
description: The JVM's automatic reclamation of heap objects that are no longer reachable.
---

Garbage collection is the process by which the [JVM](./JVM.md) frees memory on the
[heap](./Heap.md) that a running program can no longer reach.
```

Each file in `dictionary/` is a node. Every `[text](./Other%20Term.md)` link in the prose is an edge.
Writing a good entry and building the graph are the same act, so the graph cannot drift out of date with
the writing.

`lib/dictionary.ts` reads the folder at build time, extracts the links, and fails the build if an entry
links to a term that does not exist, or if a term is missing from the curriculum. A dead edge is a broken
build, not a silently missing line.

## The two layers

The page renders the whole dictionary twice, on purpose.

1. **The written dictionary** is server-rendered semantic HTML: a `<dl>` of every term and definition. It
   is readable with JavaScript off, crawlable, and it is what a screen reader gets.
2. **The graph** is a WebGL canvas layered on top. It needs JavaScript and a GPU, and it is enhancement.

Fetch the page with `curl` and you get a complete, readable glossary. That is the point.

## Stack

| Piece | What it does |
| --- | --- |
| Next.js (App Router) | Statically prerendered at build time |
| react-three-fiber / three.js | Renders the graph. Nodes are one `InstancedMesh`, edges one `LineSegments` |
| `d3-force-3d` | Lays the graph out in three dimensions |
| CSS Modules | Styling. No CSS framework |

Labels are DOM, not WebGL: text stays crisp at any DPI, and the scene positions each label imperatively
every frame by projecting its node to screen space.

## Running it

```bash
npm install
npm run dev     # http://localhost:3210
npm run build
```

## Adding a term

1. Write `dictionary/Your Term.md` with a `description` in the frontmatter. If the description contains a
   colon, quote it, because it is YAML.
2. Add the term to a section in `lib/curriculum.ts`. The build fails if you forget.
3. Link to it from the entries where it belongs. Those links are the only thing that puts it in the graph,
   so an entry nothing links to floats alone.

Link on the first occurrence of a term in an entry, not every occurrence.

## Interaction

- Press `/` or click the box to search. Typing a term's exact name selects it and opens its
  description; a partial query ranks title matches above description matches, dims the graph to
  the survivors, and `Enter` opens the top hit.
- Drag to turn, scroll to zoom, click a term to open it.
- Hovering a node lights it and everything it connects to, and dims the rest.
- Clicking a section in the legend spotlights that section.
- Links inside an open entry move the graph rather than scrolling the page.
- `Escape` clears the search, then the selection.

## Credits

Built by Vighnesh Shukla.
