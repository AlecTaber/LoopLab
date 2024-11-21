import { gql } from 'apollo-server-express';

const likeTypeDefs = gql`
    type Like {
        userId: ID!
    }
`;

export default likeTypeDefs;