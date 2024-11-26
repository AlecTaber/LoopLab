import { ApolloClient } from '@apollo/client';
import cache from './cache';


const backEndUrl = process.env.VITE_SOCKET_URL;

const client = new ApolloClient({
    uri: backEndUrl || 'https://looplab.onrender.com',
    cache,
});

export default client;
