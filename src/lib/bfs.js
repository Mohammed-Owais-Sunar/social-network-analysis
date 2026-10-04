// ==========================================
// BREADTH FIRST SEARCH (BFS)
// ==========================================

export function bfs(graph, startUser) {

    // If the starting user does not exist
    if (!graph.hasUser(startUser)) {
        return null;
    }


    // Queue used by BFS
    const queue = [];

    // Set keeps track of visited users
    const visited = new Set();

    // Stores the order in which users are visited
    const traversalOrder = [];

    // Stores the distance/level of each user
    const distance = new Map();
    // Stores the parent of each user in the BFS tree
const parent = new Map();


    // ==========================================
    // START BFS
    // ==========================================

    queue.push(startUser);

    visited.add(startUser);

    distance.set(startUser, 0);
parent.set(startUser, null);

    // ==========================================
    // BFS LOOP
    // ==========================================

    while (queue.length > 0) {

        // Remove the first element from queue
        const currentUser = queue.shift();

        // Add current user to traversal result
        traversalOrder.push(currentUser);


        // Get current user's friends
        const friends = graph.getFriends(currentUser);


        // Visit every friend
        for (const friend of friends) {

            // If friend has not been visited
            if (!visited.has(friend)) {

                visited.add(friend);

queue.push(friend);

// Store who discovered this friend
parent.set(friend, currentUser);

// Current user's level + 1
distance.set(
    friend,
    distance.get(currentUser) + 1
);
            }
        }
    }


    // Return BFS results
    return {
    order: traversalOrder,
    distance: distance,
    parent: parent
};
}
