import { gql } from 'apollo-server-express';

const loopTypeDefs = gql`
    type Loop {
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
        saveLoop(input: LoopInput!): Loop!
    }

`

export default loopTypeDefs;