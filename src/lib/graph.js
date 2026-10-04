class SocialGraph {

    constructor() {
        // Adjacency List
        this.adjacencyList = new Map();
    }


    // Add a new user to the graph
    addUser(user) {

        if (!user || user.trim() === "") {
            return false;
        }

        user = user.trim();

        // Prevent duplicate users
        if (this.adjacencyList.has(user)) {
            return false;
        }

        this.adjacencyList.set(user, []);

        return true;
    }


    // Add an undirected friendship
    addFriendship(user1, user2) {

        user1 = user1.trim();
        user2 = user2.trim();

        // Users cannot be friends with themselves
        if (user1 === user2) {
            return false;
        }

        // Both users must exist
        if (
            !this.adjacencyList.has(user1) ||
            !this.adjacencyList.has(user2)
        ) {
            return false;
        }

        // Prevent duplicate friendships
        if (this.adjacencyList.get(user1).includes(user2)) {
            return false;
        }

        // Because this is an undirected graph,
        // add the connection in both directions.

        this.adjacencyList.get(user1).push(user2);

        this.adjacencyList.get(user2).push(user1);

        return true;
    }


    // Get all users
    getUsers() {

        return Array.from(this.adjacencyList.keys());
    }


    // Get friends of a user
    getFriends(user) {

        if (!this.adjacencyList.has(user)) {
            return [];
        }

        return this.adjacencyList.get(user);
    }


    // Get total number of friendships
    getConnectionCount() {

        let total = 0;

        for (const friends of this.adjacencyList.values()) {

            total += friends.length;

        }

        // Every friendship is stored twice
        // because this is an undirected graph.

        return total / 2;
    }


    // Check whether a user exists
    hasUser(user) {

        return this.adjacencyList.has(user);

    }


    // Display the graph in the console
    displayGraph() {

        console.log("SOCIAL NETWORK GRAPH");

        for (const [user, friends] of this.adjacencyList) {

            console.log(
                `${user} → ${friends.join(", ")}`
            );

        }
    }
}


export { SocialGraph };

