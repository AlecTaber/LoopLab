import { ApolloClient } from '@apollo/client';
import cache from './cache';
import dotenv from 'dotenv';

dotenv.config();

const backEndUrl = process.env.RENDER_BACKEND_URL

const client = new ApolloClient({
    uri: backEndUrl || 'http://localhost:3001/graphql',
    cache,
});

export default client;
