import { gql } from 'apollo-server-express';

//add LoopId: ID! to the Comment type once the Post model is created
const commentTypeDefs = gql`
  type Comment {
    _id: ID!
    body: String!
    username: String!
    userId: ID!
    loopId: ID!
    likes: [Like]
  }

  type CommentPayload {
    comment: Comment!
  }

  input CreateCommentInput {
    body: String!
    username: String!
    loopId: ID!
  }

  input EditCommentInput {
    body: String!
  }

  type Query {
    getCommentsByUser(_id: ID!): [Comment]
    getCommentsByLoop(_id: ID!): [Comment]
  }

  type Mutation {
    createComment(input: CreateCommentInput): Comment!
    editComment(input: EditCommentInput): Comment!
    deleteComment(id: ID!): Comment!
  }
    `;

export default commentTypeDefs;