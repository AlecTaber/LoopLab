import './App.css';
import NavBar from './components/navbar';
import Auth from './utils/auth';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';
import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import socket from './utils/socket';

const httpLink = createHttpLink({
 uri: '/graphql', 
});

const authLink = setContext((_, {headers}) => {
  // const token = localStorage.getItem('id_token');

  return {
    headers: {
      ...headers,
      authorization: Auth.getToken() ? `Bearer ${Auth.getToken()}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})

function App() {

  useEffect(() => {
    // Connect the socket when the app is loaded
    socket.connect();

    // Debugging: Log connection status
    socket.on('connect', () => {
      console.log(`Connected to Socket.io server with ID: ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.io server');
    });

    // Clean up the socket connection when the app is unmounted
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <ApolloProvider client={client}>
      <div>
        <NavBar />
        <div>
          <Outlet />
        </div>
      </div>
    </ApolloProvider>
  );
}

export default App;
