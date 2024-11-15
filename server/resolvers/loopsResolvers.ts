import Loop from "../models/loop.js";
import { getUserDataFromToken } from "../utils/auth.js";

const loopResolvers = {
    Query: {
        getLoopsByUser: async (_: any, {userId}: {userId: string}) => {
            try {
                const loops = await Loop.find({userId});
                return loops;
            } catch (err: any){
                throw new Error("Error getting Loops from user.")
            }
        },
    },

    Mutation: {
        createLoop: async (_:any, {frames, title}: any) => {
        const user = getUserDataFromToken();

        if(!user){
            throw new Error("User not authenticated.");
        }

        const { userId } = user;
        const loop = new Loop({
            userId,
            title,
            frames
        });

        await loop.save();
        return loop;
    },

    //add mutations for editing and removing loops.
}}

export default loopResolvers;