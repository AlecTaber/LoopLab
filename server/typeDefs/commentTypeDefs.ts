import { gql } from 'apollo-server-express';

//add postId: ID! to the Comment type once the Post model is created
const commentTypeDefs = gql`
  type Comment {
    id: ID!
    body: String!
    username: String!
    userId: ID!
    }

    type Query {
      getCommentsByUser(userId: ID!): [Comment]
      getCommentsByPost(postId: ID!): [Comment]
    }

    type Mutation {
      createComment(input: CreateCommentInput): Comment!
    }

    input CreateCommentInput {
      body: String!
    }
    `;

export default commentTypeDefs;