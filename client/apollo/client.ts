import { ApolloClient } from '@apollo/client';
import cache from './cache';

const client = new ApolloClient({
    uri: 'http://localhost:3001/graphql',
    cache,
});

export default client;
