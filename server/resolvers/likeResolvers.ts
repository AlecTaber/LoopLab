import User from "../models/User.js";
import Loop from "../models/loop.js";
import Comment from "../models/Comment.js";

import { CommentArgs } from "./commentResolvers.js";
import { LoopArgs } from "./loopResolvers.js";
import { AuthenticationError } from "apollo-server-express";

export interface LikeArgs {
    userId: any
    loopId: any
    commentId: any
}


const likeResolvers = {
    Mutation: {
        addLikeToLoop: async (_:any, {_id}: LoopArgs, context: any) => {
            try {
                if (!context.userId) {
                    throw new AuthenticationError("User not authenticated!");
                }
              
                const userId = context.userId;
              
                // Fetch the loop and user
                const loop = await Loop.findById(_id);
                if (!loop) {
                throw new Error("No loop with that id!");
                }
              
                const user = await User.findById(userId);
              
                if (!user) {
                throw new Error("User not found!");
                }
              
                // Check if the user already liked the loop
                const hasLiked = loop.likes.some((like) => like.userId.toString() === userId);
              
                if (hasLiked) {
                    // Remove the like (toggle behavior)
                    await Loop.findByIdAndUpdate(
                        _id,
                        { $pull: { likes: { userId: userId } } },
                        { new: true }
                    );
                
                    const removeLikeUser = await User.findByIdAndUpdate(
                        userId, 
                        { $pull: { likesLoops: { userId: userId } } },
                        { new: true }
                    );
                    console.log("Like removed from loop");

                    console.log("Removed Like On User:", removeLikeUser)

                } else {
                    // Add the like
                    await Loop.findByIdAndUpdate(
                      _id,
                      { $push: { likes: { userId, loopId: _id } } },
                      { new: true }
                    );
              
                    await User.findByIdAndUpdate(
                      userId,
                      { $push: { likesLoops: { userId, loopId: _id } } },
                      { new: true }
                    );
                    console.log("Like added to loop");
                }
              
                // Optionally update the loop's like count
                await Loop.findByIdAndUpdate(_id, {
                  $inc: { likeCount: hasLiked ? -1 : 1 },
                });
              
                return loop;

            } catch (err: any){
                console.error("Error adding like to loop!", err)
                throw new Error("Error adding like.")
            }
        },
        addLikeToComment: async (_:any, {_id}: CommentArgs, context: any) => {
            try {
                if (!context.userId) {
                    throw new AuthenticationError("User not authenticated!");
                }
              
                const userId = context.userId;
              
                // Fetch the loop and user
                const comment = await Comment.findById(_id);
                if (!comment) {
                throw new Error("No Comment with that id!");
                }
              
                const user = await User.findById(userId);
              
                if (!user) {
                throw new Error("User not found!");
                }
              
                // Check if the user already liked the comment
                const hasLiked = comment.likes.some((comment) => comment.userId.toString() === userId);
              
                if (hasLiked) {
                    // Remove the like (toggle behavior)
                    await Comment.findByIdAndUpdate(
                        _id,
                        { $pull: { likes: { userId: userId } } },
                        { new: true }
                    );
                
                    const removeLikeUser = await User.findByIdAndUpdate(
                        userId, 
                        { $pull: { likesComments: { userId: userId } } },
                        { new: true }
                    );
                    console.log("Like removed from Comment");

                    console.log("Removed Like On User:", removeLikeUser)
                    
                } else {
                    // Add the like
                    await Comment.findByIdAndUpdate(
                      _id,
                      { $push: { likes: { userId, commentId: _id } } },
                      { new: true }
                    );
              
                    await User.findByIdAndUpdate(
                      userId,
                      { $push: { likesComments: { userId, commentId: _id } } },
                      { new: true }
                    );
                    console.log("Like added to Comment");
                }
              
                await Comment.findByIdAndUpdate(_id, {
                  $inc: { likeCount: hasLiked ? -1 : 1 },
                });
              
                return comment;

            } catch (err: any){
                console.error("Error adding like to loop!", err)
                throw new Error("Error adding like.")
            }
        }
    }
};

export default likeResolvers;