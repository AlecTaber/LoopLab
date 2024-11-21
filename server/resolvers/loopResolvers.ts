import Loop from "../models/Loop.js";
import User from "../models/User.js";
import { LikeArgs } from "./likeResolvers.js";
import { AuthenticationError } from "apollo-server-express";

export interface LoopArgs {
    _id: any,
    userId: any,
    title: string,
    frames: {
        frameId: string,
        canvasImg: string
    }[];
    comments: [any]
    likes: [LikeArgs],
    likeCount: number
}

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
    Query: {
        getLoops: async () => {
            return Loop.find().sort({createdAt: -1});
        },
        getLoop: async (_parent: any, {_id}: LoopArgs) => {
            return Loop.findById(_id);
        },
    }, 

    Mutation: {
        //add add like mutation
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
                    {$addToSet: {loops: newLoop.id}},
                    {new: true}
                );

                return newLoop;


            } catch (error) {
                console.error("error saving loop: ", error);
                throw new Error("error saving loop");
            }
        },

        deleteLoop: async(_parent: any, {_id}: LoopArgs, context: any) => {
            if(context.userId){
                const deletedLoop = await Loop.findByIdAndDelete(_id);

                if(!deletedLoop){
                    throw new Error("Could not find Loop!")
                };

                const updatedUser = await User.findByIdAndUpdate(
                    {_id: context.userId},
                    {$pull: {loops: {_id: _id}}},
                    {new: true}
                );

                if(!updatedUser){
                    throw new AuthenticationError('Could not find user!')
                };

                return deletedLoop;
            }

            throw new AuthenticationError("You must be logged in to delete a loop!")
        }
    }
}

export default LoopResolvers;