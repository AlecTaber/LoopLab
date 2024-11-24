import User from "../models/User.js";
import Loop from "../models/loop.js";
import Comment from "../models/Comment.js";
import { io } from "../server.js";

import { CommentArgs } from "./commentResolvers.js";
import { LoopArgs } from "./loopResolvers.js";
import { AuthenticationError } from "apollo-server-express";
import mongoose from "mongoose";
import { ILike } from "../models/Like.js";

export interface LikeArgs {
    userId: any
    loopId: any
    commentId: any
}


const likeResolvers = {
    Mutation: {
        addLikeToLoop: async (_: any, { _id }: LoopArgs, context: any) => {
            try {
                console.log("Received _id:", _id); // Log incoming ID
                if (!context.userId) {
                    throw new AuthenticationError("User not authenticated!");
                }
        
                const userId = context.userId;
        
                // Find the loop and populate likes
                const loop = await Loop.findById(_id).populate('likes');
                if (!loop) {
                    throw new Error("No loop found with that ID!");
                }
        
                // Check if the user has already liked the loop
                const existingLike = loop.likes.find(
                    (like) => like.userId.toString() === userId
                );
        
                if (existingLike) {
                    // User has already liked the loop, so remove the like
                    loop.likes = loop.likes.filter(
                        (like) => like.userId.toString() !== userId
                    );
                    loop.likeCount -= 1;
                } else {
                    // User hasn't liked the loop, so add the like
                    loop.likes.push({
                        userId: new mongoose.Types.ObjectId(userId),
                        loopId: loop._id,
                    } as ILike);
                    loop.likeCount += 1;
                }
        
                // Save the updated loop
                await loop.save();
        
                // Emit the like update event with the updated likes array
                io.emit('likeUpdate', {
                    loopId: loop._id,
                    likeCount: loop.likeCount,
                    likes: loop.likes,
                });
        
                // Return the updated loop with populated likes
                const updatedLoop = await Loop.findById(_id).populate('likes');
                return updatedLoop;
            } catch (err: any) {
                console.error("Error adding/removing like:", err);
                throw new Error("Failed to toggle like on the loop.");
            }
        },
                      
        
        addLikeToComment: async (_: any, { _id }: CommentArgs, context: any) => {
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

                const updatedComment = await Comment.findById(_id); // Fetch the updated comment with the correct likeCount
                io.emit('likeUpdate', {
                    commentId: _id,
                    userId: context.userId,
                    likeCount: updatedComment?.likeCount ?? 0, // Use the updated likeCount directly from the document
                });

                return comment;

            } catch (err: any) {
                console.error("Error adding like to loop!", err)
                throw new Error("Error adding like.")
            }
        }
    }
};

export default likeResolvers;