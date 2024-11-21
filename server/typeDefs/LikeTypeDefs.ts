import { gql } from 'apollo-server-express';

const likeTypeDefs = gql`
    type Like {
        userId: ID!
    }

    type Mutation {
        addLikeToLoop(_id: ID!): Loop!
        addLikeToComment(_id: ID!): Comment!
    }
`;

export default likeTypeDefs;