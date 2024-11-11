import express, { Application } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { ApolloServer } from 'apollo-server-express';
import connection from './config/connection.js';
import { verifyToken } from './utils/jwt.js';
import userTypeDefs from './typeDefs/userTypeDefs.js';
import userResolvers from './resolvers/userResolvers.js';
import { makeExecutableSchema } from '@graphql-tools/schema';

const app: Application = express();
connection();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

const schema = makeExecutableSchema({
  typeDefs: [userTypeDefs],
  resolvers: [userResolvers],
  // Add further typeDefs and resolvers here
});

const apolloServer = new ApolloServer({
  schema,
  context: ({ req }) => {
    const token = req.headers.authorization?.split(" ")[1] || '';
    const payload = verifyToken(token);
    const userId = payload ? payload.userId : null; // Safely handle null payload
    console.log('User ID:', userId);
    return { userId };
  },
});

await apolloServer.start();

apolloServer.applyMiddleware({ app, path: '/graphql' });

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GraphQL server running on http://localhost:${PORT}${apolloServer.graphqlPath}`);
});