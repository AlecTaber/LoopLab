import express, { Application } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { ApolloServer } from 'apollo-server-express';
import connection from './config/connection';
import { verifyToken } from './utils/jwt';

//import the next line after creating the schema
//import schema from './schema';

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

const apolloServer = new ApolloServer({
  schema,
  context: ({ req }) => {
    const token = req.headers.authorization || '';
    try {
      const payload = verifyToken(token);
      const userId = payload.userId;
      console.log('User ID:', userId);
      return { userId };
    } catch (error) {
      console.error('Error:', error);
      return error;
    }
  },
});

await apolloServer.start();

apolloServer.applyMiddleware({ app, path: '/graphql' });

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GraphQL server running on http://localhost:${PORT}${apolloServer.graphqlPath}`);
});