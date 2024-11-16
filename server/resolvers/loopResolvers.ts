import Loop from "../models/loop.js";
import { getUserDataFromToken } from "../utils/auth.js";

const LoopResolvers = {
    Mutation: {
        saveLoop: async (_: any, { title, frames }: { title: string; frames: string }) => {
            try {
                const newLoop = new Loop({title, frames});
                const savedLoop = await newLoop.save();
                return savedLoop;
            } catch (error) {
                throw new Error("error saving loop");
            }
        }
    }
}

export default LoopResolvers;