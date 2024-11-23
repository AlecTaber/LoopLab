import { gql } from 'apollo-server-express';

const loopTypeDefs = gql`

    type Loop {
        _id: ID!
        userId: ID!
        title: String!
        frames: [Frame!]!
        comments: [Comment]
        likes: [Like]
        likeCount: Int
        createdAt: String!
        updatedAt: String!
    }

    type Frame {
        frameId: String!
        canvasImg: String
    }

    type Comment {
    _id: ID
    username: String
    body: String
    userId: ID
    loopId: ID
    likeCount: Int
    likes: [Like]
    }

    input FrameInput {
        frameId: String!
        canvasImg: String!
    }
    
    input LoopInput {
        title: String!,
        frames: [FrameInput!]!
    }

    type Query {
        getLoops: [Loop!]!
        getLoop(_id: ID!): Loop
        getLoopsByUser(userId: ID!, page: Int!, limit: Int!): [Loop!]!
    }

    type Mutation {
        saveLoop(input: LoopInput!): Loop!
        deleteLoop(_id: String!): Loop!
    }

`

export default loopTypeDefs;