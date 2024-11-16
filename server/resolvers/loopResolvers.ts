import Loop from "../models/loop.js";
//import { getUserDataFromToken } from "../utils/auth.js";

const LoopResolvers = {
    Mutation: {
        saveLoop: async (_: any, { title, frames }: { title: string; frames: any[] }) => {
            try {
                console.log("received title: ", title);
                console.log("received frames: ", frames);
                if (!title || !frames || !frames.length) {
                    throw new Error("invalid input");
                }
                const validFrames = frames.filter((frame) => frame.frameId && frame.canvasImg);
                if (validFrames.length !== frames.length) {
                    console.error("some frames have missing or invalid data", frames);
                    throw new Error("invalid frame data detected");
                } 
                const newLoop = new Loop({title, frames:validFrames});
                const savedLoop = await newLoop.save();
                console.log("saved loop in database: ", savedLoop);
                return savedLoop;
            } catch (error) {
                console.error("error saving loop: ", error);
                throw new Error("error saving loop");
            }
        }
    }
}

export default LoopResolvers;