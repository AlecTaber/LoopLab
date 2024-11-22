import { gql } from 'apollo-server-express';

const loopTypeDefs = gql`

    type Loop {
        _id: ID!
        userId: ID!
        title: String!
        frames: [Frame!]!
        comments: [Comment]
        likes: [Like]
    }

    type Frame {
        frameId: String!
        canvasImg: String
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
    }

    type Mutation {
        saveLoop(input: LoopInput!): Loop!
        deleteLoop(_id: String!): Loop!
    }

`

export default loopTypeDefs;