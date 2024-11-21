import User from "../models/User.js";
import Loop from "../models/Loop.js";
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
                
                    await User.findByIdAndUpdate(
                        userId, 
                        { $pull: { likes: {loop: { userId: userId } } } },
                        { new: true }
                    );
                    console.log("Like removed from loop");
                } else {
                    // Add the like
                    await Loop.findByIdAndUpdate(
                      _id,
                      { $push: { likes: { userId, loopId: _id } } },
                      { new: true }
                    );
              
                    await User.findByIdAndUpdate(
                      userId,
                      { $push: { likes: {loop: { userId, loopId: _id } } } },
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
                    throw new Error("Not authenticated");
                }

                const userId = context.userId;

                // Check if the comment exists
                const comment = await Comment.findById(_id);
                if (!comment) {
                    throw new Error("Comment not found");
                }

                // Check if the user already liked this comment
                const user = await User.findOne({
                    _id: userId,
                    "likes.comments": { $elemMatch: { _id } },
                });

                if (user) {
                    // If the like already exists, remove it (toggle behavior)
                    await User.findByIdAndUpdate(userId, {
                        $pull: { "likes.comments": { _id } },
                    });
                    console.log("Like removed from comment");
                } else {
                    // Otherwise, add the like
                    await User.findByIdAndUpdate(userId, {
                        $push: { "likes.comments": { _id } },
                    });
                    console.log("Like added to comment");
                }

                // Optionally, update the comment model to store the count
                await Comment.findByIdAndUpdate(_id, {
                    $inc: { likesCount: user ? -1 : 1 },
                });

                return comment;

            } catch (err: any){
                console.error("Error adding like to Comment!", err)
                throw new Error("Error adding like.")
            }
        }
    }
};

export default likeResolvers;