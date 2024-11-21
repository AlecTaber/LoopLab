import userResolvers from "./userResolvers.js";
import LoopResolvers from "./loopResolvers.js";
import commentResolvers from "./commentResolvers.js";
import likeResolvers from "./likeResolvers.js";

const resolvers = [
    userResolvers,
    LoopResolvers,
    commentResolvers,
    likeResolvers
]

export default resolvers