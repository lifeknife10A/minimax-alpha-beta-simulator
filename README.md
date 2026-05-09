# Minimax, Alpha-Beta, A*, and AO* Simulator

## Direct Viewing

Open the live simulator here:

https://lifeknife10a.github.io/ai-search-algorithm-simulator/

This is a frontend-only React project made with Vite. It is an interactive
academic simulator for learning Minimax, Alpha-Beta Pruning, A* search, and
AO* search using visual graph steps.

## Folder Structure

```text
ai-search-algorithm-simulator/
  index.html
  package.json
  README.md
  src/
    App.jsx
    App.css
    index.jsx
    index.css
    treeTools.js
```

## Main Features

- Create and edit trees manually
- Add and remove nodes
- Edit node labels
- Edit utility values, including negative utilities
- Edit heuristic values for search algorithms
- Edit edge costs for A* and AO*
- Run normal Minimax
- Run Alpha-Beta Pruning
- Run A* search
- Run AO* search
- Generate a Minimax and Alpha-Beta example tree
- Generate an A* example graph
- Generate an AO* AND-OR graph
- Use AO* `OR option` and `AND group` connections from a parent node
- Step forward and step back through the algorithm
- Reset the simulation without deleting the graph
- Highlight the current node
- Highlight the final selected path
- Mark pruned branches visually
- Show the root answer clearly
- Show alpha and beta values for Minimax and Alpha-Beta nodes
- Show node type, value, visited state, and pruned state
- Use dark mode
- Use Focus Graph mode while stepping
- Use floating Step Forward and Step Back controls on the graph
- Use Safe Leave and browser autosave to avoid losing work
- Open Exam Mode as a sliding explanation panel
- View a step-by-step execution log

## AO* Notes

AO* uses an AND-OR graph.

- `OR` node: choose the cheapest available option
- `AND` node: all child branches are required
- `OR option`: the child is treated as one separate option from its parent
- `AND group`: grouped children are solved together from the parent

Example:

```text
A connects to B, C, and D
B is an OR option
C and D are in one AND group
```

In the simulator, select `C` and `D`, then set `Connection From Parent` to
`AND group`.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL shown by Vite. It is usually:

```text
http://localhost:5173/
```

Build for production:

```bash
npm run build
```

## Dependencies

- React
- React DOM
- Vite

No backend is required.
