import { gql } from 'apollo-server-express';

const userTypeDefs = gql`
  type User {
    _id: ID!
    username: String!
    email: String!
    password: String!
    loops: [Loop]
    comments: [Comment]
    likes: {
      loops: [Like]
      comments: [Like]
    }
    loopCount: Number
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    getUserbyId(_id: ID!): User!
    getUserByLoop(_id: ID!): User!
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
  }
`;

export default userTypeDefs;