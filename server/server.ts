import express, { Application } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { ApolloServer } from 'apollo-server-express';
import connection from './config/connection.js';
import { verifyToken } from './utils/jwt.js';
import userTypeDefs from './typeDefs/userTypeDefs.js';
import userResolvers from './resolvers/userResolvers.js';
import { makeExecutableSchema } from '@graphql-tools/schema';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();

// Initialize MongoDB Atlas connection
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

// Define GraphQL schema
const schema = makeExecutableSchema({
  typeDefs: [userTypeDefs],
  resolvers: [userResolvers],
});

const apolloServer = new ApolloServer({
  schema,
  context: ({ req }) => {
    const token = req.headers.authorization?.split(" ")[1] || '';
    const payload = verifyToken(token);
    const userId = payload ? payload.userId : null;
    return { userId };
  },
});

// Start the Apollo Server and apply it to the Express app
(async function startServer() {
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/graphql' });

  const PORT: number = parseInt(process.env.PORT || '3001', 10);
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`GraphQL server running on http://localhost:${PORT}${apolloServer.graphqlPath}`);
  });
})();
