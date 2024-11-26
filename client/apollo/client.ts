import { ApolloClient } from '@apollo/client';
import cache from './cache';


const backEndUrl = process.env.VITE_SOCKET_URL || 'https://looplab.onrender.com/graphql';

const client = new ApolloClient({
    uri: backEndUrl,
    cache,
});

export default client;
