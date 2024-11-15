import { gql } from 'apollo-server-express';

const loopTypeDefs = gql`
    type Loop {
        id: ID!
        loopId: String,
        title: String,
        frames: [Frame]
    }

    type Frame {
        frameId: String
        canvasImg: String
        data: [[Int]]
    }
    
    input FrameInput {
        frameId: String
        canvasImg: String
        data: [Int]
        width: Int
        height: Int
        colorSpace: String
    }

    type Query {
        getLoopsByUser(userId: ID!): [Loop]
    }

    type Mutation {
        createLoop(frames: [FrameInput]!, title: String!): Loop!
    }

`

export default loopTypeDefs;