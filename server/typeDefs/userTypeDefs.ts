import { gql } from 'apollo-server-express';

const userTypeDefs = gql`
  type LikeUser {
    loop: [Like]
    comment: [Like]
  }

  type User {
    _id: ID!
    username: String!
    email: String!
    password: String!
    loops: [Loop]
    comments: [Comment]
    likesLoops: [Like]
    likesComments: [Like]
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    getUserById(_id: ID!): User!
    getUserByLoop(_id: ID!): User!
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    updateUsername(userId: ID!, username: String!): User!
  }
`;

export default userTypeDefs;