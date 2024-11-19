import { gql } from 'apollo-server-express';

const loopTypeDefs = gql`
    type Loop {
        _id: ID!
        userId: ID!
        title: String!
        frames: [Frame!]!
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

    type Mutation {
        saveLoop(input: LoopInput!): User
    }

`

export default loopTypeDefs;