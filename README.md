# Social Network Analysis

An interactive web application for building, visualizing, and analyzing social networks using classic **Design and Analysis of Algorithms (DAA)** graph concepts. Add users, connect them, and watch graph algorithms run on your network in real time.

## Project Overview

Social Network Analysis is a React + Vite application that models a social network as an undirected graph. Every user is a node and every friendship is an edge. The app lets you explore how fundamental graph algorithms — BFS, DFS, and shortest-path search — behave on your network, and provides useful network statistics and friend recommendations.

## Features

- **Graph Builder** — Add users and create friendships to build your own social network.
- **Live Graph Visualization** — Nodes and edges rendered with SVG in a BFS-tree layout; the shortest path and traversal order are animated.
- **Graph Traversal** — Run Breadth-First Search (BFS) and Depth-First Search (DFS) from any user and watch the visit order animate step by step.
- **Connection Analysis** — Find the shortest path between any two users (BFS-based), including the number of steps.
- **User Analysis** — Inspect a user's degree, friend list, mutual friends with another user, and friend suggestions ranked by the number of mutual connections.
- **Network Statistics** — Total users, total connections, average degree, isolated users, and the most connected user.
- **Sample Network** — Load a prebuilt example network with one click, or clear everything to start over.
- **Persistence** — The graph is automatically saved to `localStorage` and restored on reload.

## DAA / Graph Concepts Used

- **Undirected Graph** representation using an **adjacency list**
- **Breadth-First Search (BFS)** — traversal order, distance levels, and parent tracking
- **Depth-First Search (DFS)** — traversal order
- **Shortest Path** between two nodes using BFS (minimum number of friendship hops)
- **Mutual Friends** — set intersection between two adjacency lists
- **Friend Suggestions** — friends-of-friends counted by shared mutual connections
- **Degree & Network Statistics** — average degree, isolation, connectivity analysis

## Tech Stack

- **React 19** — UI components and state
- **Vite** — dev server and production bundler
- **Three.js + @designcodeio/threeui** — animated background effects
- **Oxlint** — linting
- **localStorage** — client-side persistence

## Project Structure

```
social-network-analysis/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── main.jsx          # App entry point
    ├── App.jsx           # Main UI and graph state
    ├── App.css           # Styling
    ├── index.css
    ├── assets/
    └── lib/
        ├── graph.js      # SocialGraph (adjacency-list graph)
        ├── bfs.js        # Breadth-First Search
        ├── dfs.js        # Depth-First Search
        └── analysis.js   # Path finding, mutual friends, suggestions
```

## Installation

```bash
git clone https://github.com/Mohammed-Owais-Sunar/social-network-analysis.git
cd social-network-analysis
npm install
```

## Development

```bash
npm run dev
```

Starts the Vite dev server with hot module replacement.

## Production Build

```bash
npm run build
```

Bundles the app into the `dist/` folder.

## Preview Production Build

```bash
npm run preview
```

Serves the production build locally for testing.

## Screenshots

> Add screenshots of the app here. For example:

<!-- ![Graph Visualization](screenshots/graph.png) -->
<!-- ![BFS Traversal](screenshots/bfs.png) -->
<!-- ![Connection Analysis](screenshots/connection.png) -->

## Live Demo

> Deploy the app (e.g., GitHub Pages, Vercel, or Netlify) and add the link here.

```
https://mohammed-owaissanar.github.io/social-network-analysis/
```

## Author

**Mohammed Owais Sunar**

- GitHub: [@Mohammed-Owais-Sunar](https://github.com/Mohammed-Owais-Sunar)

---

*B.Tech project — Design and Analysis of Algorithms (DAA)*
## 🌐 Live Demo

[🚀 Open Social Network Analysis](https://social-network-analysis-seven.vercel.app)
