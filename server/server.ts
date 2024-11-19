import express, { Application } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { ApolloServer } from 'apollo-server-express';
import connection from './config/connection.js';
import { verifyToken } from './utils/jwt.js';
import userTypeDefs from './typeDefs/userTypeDefs.js';
import userResolvers from './resolvers/userResolvers.js';
import loopResolvers from './resolvers/loopResolvers.js';
import loopTypeDefs from './typeDefs/loopTypeDefs.js';
import commentTypeDefs from './typeDefs/commentTypeDefs.js';
import commentResolvers from './resolvers/commentResolvers.js';
import { makeExecutableSchema } from '@graphql-tools/schema';
import dotenv from 'dotenv';
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";

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
  typeDefs: [userTypeDefs, loopTypeDefs, commentTypeDefs],
  resolvers: [userResolvers, loopResolvers, commentResolvers],
});

const apolloServer = new ApolloServer({
  schema,
  // context: ({ req }) => {
  //   const token = req.headers.authorization?.split(" ")[1] || '';
  //   const payload = verifyToken(token);
  //   const userId = payload ? payload.userId : null;
  //   return { userId };
  // },
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
