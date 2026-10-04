import { useRef, useState } from "react";
import { InterfaceLines } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";
import "./App.css";

import { SocialGraph } from "./lib/graph";
import { bfs } from "./lib/bfs";
import { dfs } from "./lib/dfs";
import { findConnection, suggestFriends, findMutualFriends } from "./lib/analysis";

function getEdges(graph) {
  const edges = [];
  const users = graph.getUsers();

  for (const user of users) {
    for (const friend of graph.getFriends(user)) {
      if (users.indexOf(friend) > users.indexOf(user)) {
        edges.push([user, friend]);
      }
    }
  }

  return edges;
}

function getTreePositions(graph, root) {
  const positions = {};
  const users = graph.getUsers();

  // BFS levels from the root
  const level = new Map();
  const queue = [];

  if (root && graph.hasUser(root)) {
    queue.push(root);
    level.set(root, 0);
  } else if (users.length) {
    queue.push(users[0]);
    level.set(users[0], 0);
  }

  while (queue.length > 0) {
    const current = queue.shift();
    for (const friend of graph.getFriends(current)) {
      if (!level.has(friend)) {
        level.set(friend, level.get(current) + 1);
        queue.push(friend);
      }
    }
  }

  // Unreachable nodes go in a bottom row
  let maxLevel = 0;
  for (const l of level.values()) {
    if (l > maxLevel) maxLevel = l;
  }
  const disconnected = [];
  for (const user of users) {
    if (!level.has(user)) disconnected.push(user);
  }
  if (disconnected.length) {
    maxLevel += 1;
    for (const user of disconnected) level.set(user, maxLevel);
  }

  // Group by level
  const byLevel = new Map();
  for (const user of users) {
    const l = level.get(user);
    if (!byLevel.has(l)) byLevel.set(l, []);
    byLevel.get(l).push(user);
  }

  const rowGap = maxLevel === 0 ? 0 : 70 / maxLevel;

  for (const [l, nodes] of byLevel) {
    nodes.forEach((user, i) => {
      positions[user] = {
        left: ((i + 1) / (nodes.length + 1)) * 100,
        top: 12 + l * rowGap,
      };
    });
  }

  return positions;
}

function App() {
  const graphRef = useRef(null);
  if (graphRef.current === null) {
    graphRef.current = new SocialGraph();
    try {
      const stored = localStorage.getItem("daa-graph");
      if (stored) {
        const { users: savedUsers, edges: savedEdges } = JSON.parse(stored);
        (savedUsers || []).forEach((u) => graphRef.current.addUser(u));
        (savedEdges || []).forEach(([a, b]) => graphRef.current.addFriendship(a, b));
      }
    } catch {
      // ignore corrupted storage
    }
  }
  const graph = graphRef.current;

  const [users, setUsers] = useState(() => graph.getUsers());
  const [name, setName] = useState("");
  const [friendOne, setFriendOne] = useState("");
  const [friendTwo, setFriendTwo] = useState("");

  const [traversal, setTraversal] = useState(null); // { type, order }
  const [visited, setVisited] = useState([]);

  const [connection, setConnection] = useState(null); // { found, path, distance }

  const [analysis, setAnalysis] = useState(null);
  const timerRef = useRef(null);
  const [pathHighlight, setPathHighlight] = useState([]);

  const [startUser, setStartUser] = useState("");
  const [sourceUser, setSourceUser] = useState("");
  const [targetUser, setTargetUser] = useState("");
  const [analysisUser, setAnalysisUser] = useState("");
  const [compareUser, setCompareUser] = useState("");

  const refresh = () => {
    const g = graphRef.current;
    setUsers([...g.getUsers()]);
    setVisited([]);
    setTraversal(null);
    setConnection(null);
    setAnalysis(null);
    setPathHighlight([]);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      localStorage.setItem(
        "daa-graph",
        JSON.stringify({ users: g.getUsers(), edges: getEdges(g) })
      );
    } catch {
      // ignore storage errors
    }
  };

  const addUser = () => {
    const username = name.trim();
    if (!username) return;

    if (!graph.addUser(username)) {
      alert("User already exists!");
      return;
    }

    setName("");
    refresh();
  };

  const addFriendship = () => {
    const u1 = friendOne.trim();
    const u2 = friendTwo.trim();

    if (!u1 || !u2) return;
    if (!graph.hasUser(u1) || !graph.hasUser(u2)) {
      alert("Both users must exist first.");
      return;
    }

    if (!graph.addFriendship(u1, u2)) {
      alert("Friendship already exists or is invalid.");
      return;
    }

    setFriendOne("");
    setFriendTwo("");
    refresh();
  };

  const clearNetwork = () => {
    graphRef.current = new SocialGraph();
    setName("");
    setFriendOne("");
    setFriendTwo("");
    setStartUser("");
    setSourceUser("");
    setTargetUser("");
    setAnalysisUser("");
    setCompareUser("");
    setUsers([]);
    setVisited([]);
    setTraversal(null);
    setConnection(null);
    setAnalysis(null);
    setPathHighlight([]);
    if (timerRef.current) clearInterval(timerRef.current);
    localStorage.removeItem("daa-graph");
  };

  const loadSample = () => {
    graphRef.current = new SocialGraph();
    const g = graphRef.current;
    ["Owais", "Ramana", "Harsha", "Sashi", "Praveen", "Maqsud"].forEach((u) => g.addUser(u));
    g.addFriendship("Owais", "Ramana");
    g.addFriendship("Owais", "Harsha");
    g.addFriendship("Ramana", "Sashi");
    g.addFriendship("Harsha", "Praveen");
    g.addFriendship("Sashi", "Maqsud");
    g.addFriendship("Praveen", "Maqsud");
    setSourceUser("");
    setTargetUser("");
    setStartUser("");
    setAnalysisUser("");
    setCompareUser("");
    refresh();
  };

  const animateSteps = (steps) => {
    if (timerRef.current) clearInterval(timerRef.current);
    let i = 0;
    timerRef.current = setInterval(() => {
      i++;
      setVisited(steps.slice(0, i));
      if (i >= steps.length) clearInterval(timerRef.current);
    }, 550);
  };

  const runBfs = () => {
    if (!startUser) return;
    const result = bfs(graph, startUser);
    if (!result) return;
    setConnection(null);
    setPathHighlight([]);
    setVisited([]);
    setTraversal({ type: "BFS", order: result.order });
    animateSteps(result.order);
  };

  const runDfs = () => {
    if (!startUser) return;
    const result = dfs(graph, startUser);
    if (!result) return;
    setConnection(null);
    setPathHighlight([]);
    setVisited([]);
    setTraversal({ type: "DFS", order: result.order });
    animateSteps(result.order);
  };

  const findPath = () => {
    if (!sourceUser || !targetUser) return;
    const result = findConnection(graph, sourceUser, targetUser);
    setVisited([]);
    setTraversal(null);
    setConnection(result);

    if (result && result.found) {
      if (timerRef.current) clearInterval(timerRef.current);
      let i = 0;
      setPathHighlight([]);
      timerRef.current = setInterval(() => {
        i++;
        setPathHighlight(result.path.slice(0, i));
        if (i >= result.path.length) clearInterval(timerRef.current);
      }, 550);
    } else {
      setPathHighlight([]);
    }
  };

  const analyzeUser = () => {
    if (!analysisUser) return;
    const friends = graph.getFriends(analysisUser);
    const mutual =
      compareUser && graph.hasUser(compareUser)
        ? findMutualFriends(graph, analysisUser, compareUser)
        : [];
    const suggestions = suggestFriends(graph, analysisUser);

    setAnalysis({
      user: analysisUser,
      degree: friends.length,
      friends,
      suggestions,
      mutual,
    });
  };

  // ---------- stats ----------
  const connectionCount = graph.getConnectionCount();
  let totalDegree = 0;
  let isolated = 0;
  let mostConnected = "-";
  let highest = 0;

  for (const user of users) {
    const friends = graph.getFriends(user);
    totalDegree += friends.length;
    if (friends.length === 0) isolated++;
    if (friends.length > highest) {
      highest = friends.length;
      mostConnected = user;
    }
  }

  const avgDegree = users.length
    ? (totalDegree / users.length).toFixed(2)
    : "0";

  const edges = getEdges(graph);
  const positions = getTreePositions(graph, startUser);

  const pathSet = new Set(
    pathHighlight.length ? pathHighlight : connection?.found ? connection.path : []
  );
  const visitedSet = new Set(visited);

  return (
    <div className="app">

      <div className="bg-layer">
        <InterfaceLines mode="dark" hue={0} density={1} opacity={0.5} />
      </div>

      <header className="navbar">
        <div className="logo-box">✦</div>

        <div>
          <h2>DAA</h2>
          <span>SOCIAL NETWORK ANALYZER</span>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          System Ready
        </div>
      </header>

      <main>

        <section className="hero">
          <div className="hero-text">
            <p className="eyebrow">GRAPH ALGORITHM LAB</p>

            <h1>
              Analyze Your
              <span> Social Network</span>
            </h1>

            <p>
              Visualize relationships, explore graph algorithms,
              and discover connections between users.
            </p>
          </div>

          <div className="hero-orb">
            DAA
          </div>
        </section>

        <section className="stats">

          <div className="stat-card">
            <span>USERS</span>
            <strong>{users.length}</strong>
          </div>

          <div className="stat-card">
            <span>CONNECTIONS</span>
            <strong>{connectionCount}</strong>
          </div>

          <div className="stat-card">
            <span>AVG. DEGREE</span>
            <strong>{avgDegree}</strong>
          </div>

          <div className="stat-card">
            <span>ISOLATED USERS</span>
            <strong>{isolated}</strong>
          </div>

        </section>

        <section className="workspace">

          <div className="panel">

            <div className="panel-title">
              <div>
                <small>GRAPH BUILDER</small>
                <h3>Build Your Graph</h3>
              </div>
            </div>

            <div className="input-row">

              <input
                type="text"
                placeholder="Enter username..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addUser();
                }}
              />

              <button type="button" onClick={addUser}>Add User</button>
            </div>

            <div className="input-row">
              <input
                type="text"
                placeholder="User 1"
                value={friendOne}
                onChange={(e) => setFriendOne(e.target.value)}
              />

              <input
                type="text"
                placeholder="User 2"
                value={friendTwo}
                onChange={(e) => setFriendTwo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addFriendship();
                }}
              />

              <button type="button" onClick={addFriendship}>Connect</button>
            </div>

            <div className="users-list">

              {users.length === 0 ? (
                <div className="empty">
                  No users yet. Add your first user.
                </div>
              ) : (
                users.map((user) => (
                  <div className="user-chip" key={user}>
                    <span className="user-dot"></span>
                    {user}
                  </div>
                ))
              )}

            </div>

            {users.length > 0 && (
              <button type="button" className="secondary" onClick={clearNetwork}>
                Clear Network
              </button>
            )}

            <button type="button" className="secondary" onClick={loadSample}>
              Load Sample Network
            </button>

          </div>

          <div className="panel graph-panel">

            <div className="panel-heading">
              <div>
                <small>VISUALIZATION</small>
                <h3>Social Network Graph</h3>
              </div>

              <span className="live">
                ● LIVE
              </span>
            </div>

            <div className="graph-area">

              {users.length === 0 ? (
                <div className="graph-empty">
                  <div className="graph-core">DAA</div>
                  <p>Add users to build your network</p>
                </div>

              ) : (
                <>
                  <svg className="edges-svg">
                    {edges.map(([a, b]) => (
                      <line
                        key={`${a}-${b}`}
                        x1={`${positions[a].left}%`}
                        y1={`${positions[a].top}%`}
                        x2={`${positions[b].left}%`}
                        y2={`${positions[b].top}%`}
                        className={
                          pathSet.size && pathSet.has(a) && pathSet.has(b)
                            ? "edge path-edge"
                            : "edge"
                        }
                      />
                    ))}
                  </svg>

                  {users.map((user) => (
                    <div
                      className={`graph-node-abs ${
                        pathSet.has(user)
                          ? "path-node"
                          : visitedSet.has(user)
                          ? "visited-node"
                          : ""
                      }`}
                      key={user}
                      style={{
                        left: `${positions[user].left}%`,
                        top: `${positions[user].top}%`,
                      }}
                    >
                      <span></span>
                      {user}
                    </div>
                  ))}

                </>
              )}

            </div>

          </div>

        </section>

        <section className="algorithm-grid">

          <div className="panel">

            <small>ALGORITHMS</small>
            <h3>Graph Traversal</h3>

            <select
              value={startUser}
              onChange={(e) => setStartUser(e.target.value)}
            >
              <option value="">Select a user</option>

              {users.map((user) => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>

            <div className="button-row">

              <button type="button" onClick={runBfs}>Run BFS →</button>
              <button type="button" className="secondary" onClick={runDfs}>Run DFS →</button>

            </div>

            {traversal && (
              <p className="result-text">
                {traversal.type}: {traversal.order.join(" → ")}
              </p>
            )}

          </div>

          <div className="panel">

            <small>ANALYSIS</small>
            <h3>User Analysis</h3>

            <select
              value={analysisUser}
              onChange={(e) => setAnalysisUser(e.target.value)}
            >
              <option value="">Select a user</option>

              {users.map((user) => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>

            <select
              value={compareUser}
              onChange={(e) => setCompareUser(e.target.value)}
            >
              <option value="">Compare with (optional)</option>

              {users.map((user) => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>

            <button type="button" onClick={analyzeUser}>Analyze User →</button>

            {analysis && (
              <div className="result-text">
                <p>Degree: {analysis.degree}</p>
                <p>
                  Friends:{" "}
                  {analysis.friends.length
                    ? analysis.friends.join(", ")
                    : "none"}
                </p>
                <p>
                  Suggested:{" "}
                  {analysis.suggestions.length
                    ? analysis.suggestions.map(([u]) => u).join(", ")
                    : "none"}
                </p>
                {compareUser && (
                  <p>
                    Mutual with {compareUser}:{" "}
                    {analysis.mutual.length ? analysis.mutual.join(", ") : "none"}
                  </p>
                )}
              </div>
            )}

          </div>

        </section>

        <section className="panel connection-panel">

          <small>PATH FINDING</small>

          <h3>Connection Analysis</h3>

          <div className="connection-row">

            <select
              value={sourceUser}
              onChange={(e) => setSourceUser(e.target.value)}
            >
              <option value="">Start user</option>

              {users.map((user) => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>

            <select
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
            >
              <option value="">Target user</option>

              {users.map((user) => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>

            <button type="button" onClick={findPath}>Find Connection →</button>

          </div>

          {connection && (
            <p className="result-text">
              {connection.found
                ? `Path (${connection.distance} steps): ${connection.path.join(" → ")}`
                : "No connection found between these users."}
            </p>
          )}

        </section>

      </main>

      <footer>
        DAA Social Network Analyzer
        <span>Graph Algorithms • React • Three.js</span>
      </footer>

    </div>
  );
}

export default App;
