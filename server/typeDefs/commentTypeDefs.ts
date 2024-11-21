import { gql } from 'apollo-server-express';

//add LoopId: ID! to the Comment type once the Post model is created
const commentTypeDefs = gql`
  type Comment {
    id: ID!
    body: String!
    username: String!
    userId: ID!
    loopId: ID!
    likes: [Like]
    likeCount: number
  }

  type CommentPayload {
    comment: Comment!
  }

  input CreateCommentInput {
    body: String!
    postId: ID!
  }

  input EditCommentInput {
    body: String!
  }

  type Query {
    getCommentsByUser(userId: ID!): [Comment]
    getCommentsByPost(postId: ID!): [Comment]
  }

  type Mutation {
    createComment(input: CreateCommentInput): Comment!
    editComment(input: EditCommentInput): Comment!
    deleteComment(id: ID!): Comment!
  }
    `;

export default commentTypeDefs;