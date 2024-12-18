import Comment from '../models/Comment.js';
import { LikeArgs } from './likeResolvers.js';
import { getUserDataFromToken } from '../utils/auth.js';

import User from '../models/User.js';
import Loop from '../models/loop.js';
import { LoopArgs } from './loopResolvers.js';
import { AuthenticationError } from 'apollo-server-express';

import { io } from '../server.js';

export interface CommentArgs {
    _id: any,
    body: string,
    username: string,
    userId: any,
    loopId: any,
    likes: [LikeArgs],
    likeCount: number
};

interface AddCommentArgs {
    input: {
        body: string,
        username: string, 
        userId: any
        loopId: any
    }
};

const commentResolvers = {
    Query: {
        getCommentsByUser: async (_: any, { _id }: CommentArgs) => {
            try {
                const comments = await Comment.find({ userId: _id });
                if(!comments){
                    return []
                }
                return comments;
            } catch (error) {
                throw new Error("Error getting comments by user");
            }
        },

        getCommentsByLoop: async (_: unknown, { _id }: LoopArgs) => {
            try {
              const loop = await Loop.findById(_id).populate({
                path: 'comments',
                populate: { path: 'userId', select: 'username email' }, // Populate user details
              });
      
              if (!loop) {
                throw new Error("Loop not found");
              }
      
              // Map comments to ensure the response includes proper fields
              return loop.comments.map((comment: any) => ({
                _id: comment._id,
                body: comment.body,
                userId: comment.userId._id.toString(), // Ensure userId is a string
                username: comment.userId.username, // Add username explicitly
              }));
            } catch (error) {
              console.error("Error fetching comments:", error);
              throw new Error("Error fetching comments by loop");
            }
          },
    },

    Mutation: {
        //add add like mutation
        createComment: async (_: any, { input }: AddCommentArgs, context: any) => {
            console.log('CreateComment Input:', input); // Log input
            console.log('Context:', context.userId); // Log userId from context

            const user = await User.findById(context.userId); // Fetch user from context
        
            if (!user) {
                console.error('User not found!');
                throw new AuthenticationError("User not authenticated or not found!");
            }
        
            const comment = new Comment({
                body: input.body,
                username: user.username, // Use fetched username
                userId: context.userId,
                loopId: input.loopId,
            });
        
            const updatedUser = await User.findByIdAndUpdate(
                context.userId,
                { $addToSet: { comments: comment.id } },
                { new: true }
            );
        
            if (!updatedUser) {
                throw new AuthenticationError("Could not find User!");
            }
        
            const updatedLoop = await Loop.findByIdAndUpdate(
                input.loopId,
                { $addToSet: { comments: comment.id } },
                { new: true }
            );
        
            if (!updatedLoop) {
                throw new Error("No Loop with this ID exists!");
            }
        
            await comment.save();
        
            io.emit("newComment", {
                _id: comment.id,
                body: comment.body,
                username: comment.username, // Send username
                userId: comment.userId,
                loopId: comment.loopId,
            });

            await comment.save();
            console.log('Created Comment:', comment); // Log created comment
        
            return comment;
        },

        //update editComment
        editComment: async (_: any, { input }: { input: { id: string, body: string } }) => {
            const { id, body } = input;

            const user = getUserDataFromToken();
            if (!user) {
                throw new Error("Not authenticated");
            }

            const comment = await Comment.findById(id);
            if (!comment) {
                throw new Error("Comment not found");
            }

            if (comment.userId !== user.userId) {
                throw new Error("Not authorized to edit comment");
            }

            comment.body = body;
            await comment.save();

            return comment;
        },

        //update DeleteComment
        deleteComment: async (_: any, { input }: { input: { id: string } }) => {
            const { id } = input;

            const user = getUserDataFromToken();
            if (!user) {
                throw new Error("Not authenticated");
            }

            const comment = await Comment.findById(id);
            if (!comment) {
                throw new Error("Comment not found");
            }

            if (comment.userId !== user.userId) {
                throw new Error("Not authorized to delete comment");
            }

            await Comment.findByIdAndDelete(id);

            return { message: "Comment deleted successfully" };
        }
    }
};

export default commentResolvers;