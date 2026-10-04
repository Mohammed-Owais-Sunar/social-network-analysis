// ==========================================
// FIND CONNECTION USING BFS
// ==========================================

export function findConnection(graph, startUser, targetUser) {

    // Both users must exist
    if (
        !graph.hasUser(startUser) ||
        !graph.hasUser(targetUser)
    ) {
        return null;
    }


    // Same user
    if (startUser === targetUser) {

        return {
            found: true,
            path: [startUser],
            distance: 0
        };

    }


    // Queue stores users to explore
    const queue = [];

    // Visited users
    const visited = new Set();

    // Stores the previous user in the path
    const previous = new Map();


    // Start BFS
    queue.push(startUser);

    visited.add(startUser);

    previous.set(startUser, null);


    // ==========================================
    // BFS SEARCH
    // ==========================================

    while (queue.length > 0) {

        const currentUser = queue.shift();

        const friends = graph.getFriends(currentUser);


        for (const friend of friends) {

            if (!visited.has(friend)) {

                visited.add(friend);

                previous.set(friend, currentUser);

                queue.push(friend);


                // Target found
                if (friend === targetUser) {

                    const path = [];

                    let current = targetUser;


                    // Reconstruct path
                    while (current !== null) {

                        path.unshift(current);

                        current = previous.get(current);

                    }


                    return {
                        found: true,
                        path: path,
                        distance: path.length - 1
                    };

                }

            }

        }

    }


    // No connection exists
    return {
        found: false,
        path: [],
        distance: -1
    };
}
// ==========================================
// FIND MUTUAL FRIENDS
// ==========================================

export function findMutualFriends(graph, user1, user2) {

    // Both users must exist
    if (
        !graph.hasUser(user1) ||
        !graph.hasUser(user2)
    ) {
        return [];
    }


    const friends1 = graph.getFriends(user1);

    const friends2 = graph.getFriends(user2);


    // Find users present in both lists
    const mutualFriends = friends1.filter(
        friend => friends2.includes(friend)
    );


    return mutualFriends;
}
// ==========================================
// FRIEND SUGGESTIONS
// ==========================================

export function suggestFriends(graph, user) {

    if (!graph.hasUser(user)) {
        return [];
    }


    const directFriends =
        graph.getFriends(user);


    const suggestions = new Map();


    // Look at every direct friend
    for (const friend of directFriends) {

        const friendsOfFriend =
            graph.getFriends(friend);


        // Look at their friends
        for (const possibleFriend of friendsOfFriend) {

            // Don't suggest yourself
            if (possibleFriend === user) {
                continue;
            }


            // Don't suggest existing friends
            if (directFriends.includes(possibleFriend)) {
                continue;
            }


            // Count how many mutual connections
            if (!suggestions.has(possibleFriend)) {

                suggestions.set(
                    possibleFriend,
                    1
                );

            } else {

                suggestions.set(
                    possibleFriend,
                    suggestions.get(possibleFriend) + 1
                );

            }

        }

    }


    // Convert Map to array
    const result =
        Array.from(suggestions.entries());


    // Sort by number of mutual connections
    result.sort(
        (a, b) => b[1] - a[1]
    );


    return result;
}
