import { InMemoryCache } from '@apollo/client';

const cache = new InMemoryCache({
    typePolicies: {
        Loop: {
            fields: {
                likes: {
                    // Custom merge function for the `likes` array
                    merge(existing = [], incoming: any[]) {
                        const mergedLikes = [...existing];
                        incoming.forEach((newLike) => {
                            // Avoid duplicates by checking `userId`
                            const existingIndex = mergedLikes.findIndex(
                                (like) => like.userId === newLike.userId
                            );
                            if (existingIndex === -1) {
                                mergedLikes.push(newLike); // Add new like
                            } else {
                                mergedLikes[existingIndex] = newLike; // Update existing like
                            }
                        });
                        return mergedLikes;
                    },
                },
            },
        },
    },
});

export default cache;

