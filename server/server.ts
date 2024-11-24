import express, { Application } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { ApolloServer } from 'apollo-server-express';
import connection from './config/connection.js';

import resolvers from './resolvers/index.js';
import typeDefs from './typeDefs/index.js';
import { makeExecutableSchema } from '@graphql-tools/schema';

import dotenv from 'dotenv';
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";

import { verifyToken } from './utils/jwt.js';

dotenv.config();

const app: Application = express();

//set max file size and file limit
app.use(graphqlUploadExpress({
  maxFileSize: 500 * 1024 * 1024,
  maxFiles: 20
}))

// Initialize MongoDB Atlas connection
connection();

const httpServer = createServer(app);


// Export the io instance
export const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});


io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen for 'newLoop' event
  socket.on("newLoop", (newLoop) => {
    console.log("New loop received on server:", newLoop);
    io.emit("newLoop", newLoop); // Broadcast to all clients
  });

  // Listen to new Comments in the resolvers
  socket.on("newComment", (newComment) => {
    console.log("New Comment recieved on server:", newComment);
    io.emit("newComment", newComment);
  })

  // Listen to new Likes in the resolvers
  socket.on("newLike", (newLike) => {
    console.log("New Like recieved on server:", newLike);
    io.emit("newLike", newLike);
  })

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Define GraphQL schema
const schema = makeExecutableSchema({
  typeDefs: typeDefs,
  resolvers: resolvers,
});

const apolloServer = new ApolloServer({
  schema,
  context: ({ req }) => {
    if (!req.headers.authorization?.startsWith('Bearer ')) {
      console.warn("Authorization header is missing or invalid.");
      return {};
    }
    const token = req.headers.authorization?.split(" ")[1] || '';
    // console.log('Token:', token)
    const payload = verifyToken(token);
    // console.log("Payload", payload)
    const userId = payload ? payload.userId : null;
    // console.log("UserId", userId)
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
