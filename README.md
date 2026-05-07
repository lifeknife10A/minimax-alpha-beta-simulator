# Minimax + Alpha-Beta Pruning Simulator

This is a frontend-only React project made with Vite. It lets you create and
edit a game tree, then run Minimax or Alpha-Beta Pruning with visual steps.

## Folder Structure

```text
poster-app/
  index.html
  package.json
  src/
    App.jsx
    App.css
    index.jsx
    index.css
    treeTools.js
```

## Main Features

- Generate a sample depth-3 game tree with 8 leaf nodes
- Create a tree manually by adding and removing nodes
- Edit node labels and leaf utility values
- Run normal Minimax
- Run Alpha-Beta Pruning
- Step forward through either algorithm
- Reset the simulation without deleting the tree
- Show node name, type, minimax value, alpha, beta, visited state, and pruned state
- Highlight the current node, pruned branches, final selected path, and root answer
- Use a floating Step Forward button directly on the graph
- Use Focus Graph mode so only the graph and floating controls are visible while stepping
- Open Exam Mode as a sliding drawer instead of a fixed side panel
- Toggle dark mode
- Autosave the tree and current state in the browser
- Warn before leaving the page when Safe Leave is enabled
- Show an execution log and simple Exam Mode explanation for each step

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

## Upload to GitHub Pages

This project is ready for GitHub Pages using the workflow in
`.github/workflows/deploy.yml`.

1. Create a new GitHub repository, for example:

```text
minimax-alpha-beta-simulator
```

2. Open the GitHub-ready project folder in Terminal:

```bash
cd "/Users/krish/Desktop/Computer Organization & Architecture/Poster/minimax-alpha-beta-simulator-github"
```

3. Push the project to GitHub:

```bash
git init
git add .
git commit -m "Add minimax alpha-beta simulator"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/minimax-alpha-beta-simulator.git
git push -u origin main
```

4. In the GitHub repository, open:

```text
Settings -> Pages
```

5. Set the source to:

```text
GitHub Actions
```

After the workflow finishes, the site will be available at:

```text
https://YOUR_USERNAME.github.io/minimax-alpha-beta-simulator/
```

## Dependencies

- React
- React DOM
- Vite

No backend is required.
