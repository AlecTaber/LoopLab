import User from "../models/User.js";
import { AuthenticationError } from "apollo-server-express";

interface AddLoopArgs {
    input: {
        title: string
        frames: [
            {
                frameId: string,
                canvasImg: string
            } 
        ]
    }
}

const LoopResolvers = {
    Mutation: {
        saveLoop: async (_: any, { input }: AddLoopArgs, context: any) => {
            try {
                console.log("Context:", context)

                console.log("received title: ", input.title);
                console.log("received frames: ", input.frames);

                if (!input.title || !input.frames || !input.frames.length) {
                    throw new Error("invalid input");
                }

                const validFrames = input.frames.filter((frame) => frame.frameId && frame.canvasImg);
                if (validFrames.length !== input.frames.length) {
                    console.error("some frames have missing or invalid data", input.frames);
                    throw new Error("invalid frame data detected");
                } 

                if(context.user){
                    const updatedUser = await User.findByIdAndUpdate(
                        {_id: context.user.userId},
                        {$addToSet: {loops: input}},
                        {new: true},
                    );

                    console.log("Saved Loop successfully!", updatedUser);

                    return updatedUser
                }

                return console.error("User does not exist!")

            } catch (error) {
                console.error("error saving loop: ", error);
                throw new Error("error saving loop");
            }
        },

        // deleteLoop: async(_parent: any, {loopId})
    }
}

export default LoopResolvers;