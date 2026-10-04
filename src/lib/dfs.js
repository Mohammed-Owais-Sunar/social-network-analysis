// ==========================================
// DEPTH FIRST SEARCH (DFS)
// ==========================================

export function dfs(graph, startUser) {

    // Starting user must exist
    if (!graph.hasUser(startUser)) {
        return null;
    }

    // Keep track of visited users
    const visited = new Set();

    // Store DFS traversal order
    const traversalOrder = [];

    // Store parent of every visited user
    const parent = new Map();


    // Starting user's parent
    parent.set(startUser, null);


    // ==========================================
    // DFS RECURSIVE FUNCTION
    // ==========================================

    function visit(user) {

        // Mark current user visited
        visited.add(user);

        // Add to traversal order
        traversalOrder.push(user);


        // Get friends
        const friends = graph.getFriends(user);


        // Visit every unvisited friend
        for (const friend of friends) {

            if (!visited.has(friend)) {

                // Store DFS parent
                parent.set(friend, user);

                // Continue DFS
                visit(friend);
            }
        }
    }


    // Start DFS
    visit(startUser);


    // Return DFS result
    return {
        order: traversalOrder,
        parent: parent
    };
}
