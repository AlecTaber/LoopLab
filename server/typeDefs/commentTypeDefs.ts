import { gql } from 'apollo-server-express';

const commentTypeDefs = gql`
  type Comment {
    id: ID!
    body: String!
    username: String!
    postId: ID!
    userId: ID!
    }
    `;

    export default commentTypeDefs;