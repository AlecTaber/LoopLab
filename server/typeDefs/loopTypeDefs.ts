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

    type Mutation {
        saveLoop(title: String!, frames: [FrameInput!]!): Loop
    }

    input FrameInput {
        frameId: String!
        canvasImg: String!
    }

    type Query {
        getLoopsByUser(userId: ID!): [Loop]
    }

`

export default loopTypeDefs;