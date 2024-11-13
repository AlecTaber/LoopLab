import { gql } from 'apollo-server-express';

const loopTypeDefs = gql`
    type Loop {
        id: ID!
        loopId: any,
        title: String,
        frames: {
            frameId: any,
            canvasImg: String,
            data: any
        }
    }

    type Query {
        getLoopsByUser(userId: ID!): [Loop]
    }

    type Mutation {
        createLoop(frames: CreateLoopsInput): Loop!
    }

    input CreateLoopsInput {
        frames: {
            frameId: any,
            canvasImg: String
            data: any
        }
    }
`

export default loopTypeDefs;