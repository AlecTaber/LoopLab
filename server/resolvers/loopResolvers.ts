import Loop from "../models/loop.js";
import User from "../models/User.js";
import { AuthenticationError } from "apollo-server-express";

interface AddLoopArgs {
    input: {
        title: string
        frames: {
                frameId: string,
                canvasImg: string
        }[];
    }
}

const LoopResolvers = {
    Mutation: {
        saveLoop: async (_: any, { input }: AddLoopArgs, context: any) => {
            try {

                if (!context.userId){
                    throw new AuthenticationError("You need to be logged in to use this feature!")
                };

                if (!input.title || !input.frames || !input.frames.length) {
                    throw new Error("Invalid input: Title and frames are required!");
                };

                const validFrames = input.frames.filter((frame) => frame.frameId && frame.canvasImg);
                if (validFrames.length !== input.frames.length) {
                    console.error("Some frames have missing or invalid data:", input.frames);
                    throw new Error("Invalid frame data detected.");
                };

                const newLoop = await Loop.create({
                    userId: context.userId,
                    frames: validFrames,
                    title: input.title,
                });

                await User.findByIdAndUpdate(
                    context.userId,
                    {$addToSet: {loops: newLoop.userId}},
                    {new: true}
                );

                return newLoop;

                // if(context.userId){
                //     const updatedUser = await User.findByIdAndUpdate(
                //         {_id: context.userId},
                //         {$addToSet: {loops: input}},
                //         {new: true},
                //     );

                //     console.log("Saved Loop successfully!", updatedUser);

                //     return updatedUser
                // }

                // throw new AuthenticationError("User does not exist!")

            } catch (error) {
                console.error("error saving loop: ", error);
                throw new Error("error saving loop");
            }
        },

        // deleteLoop: async(_parent: any, {loopId})
    }
}

export default LoopResolvers;