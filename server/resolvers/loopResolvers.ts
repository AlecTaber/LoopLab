import { getUserDataFromToken } from "../utils/auth.js";
import Loop from "../models/loop.js";

const LoopResolvers = {
    Mutation: {
        saveLoop: async (_: any, { title, frames }: { title: string; frames: any[] }, context: any) => {
            try {
                console.log("Context:", context)
                // const user = getUserDataFromToken()
                // console.log("user:",user)
                // if(!user){
                //     throw new Error("User not authenticated!");
                // }

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

                // const { userId } = user;
                // console.log("UserId:", userId);
                // const newLoop = new Loop({userId, title, frames:validFrames});
                // const savedLoop = await newLoop.save();

                // console.log("saved loop in database: ", savedLoop);
                // return savedLoop;
            } catch (error) {
                console.error("error saving loop: ", error);
                throw new Error("error saving loop");
            }
        }
    }
}

export default LoopResolvers;