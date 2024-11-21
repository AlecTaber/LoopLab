import Comment from '../models/Comment.js';
import { LikeArgs } from './userResolvers.js';
import { getUserDataFromToken } from '../utils/auth.js';

import User from '../models/User.js';
import Loop from '../models/Loop.js';
import { LoopArgs } from './loopResolvers.js';

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
        getCommentsByUser: async (_: any, { userId }: { userId: string }) => {
            try {
                const comments = await Comment.find({ userId });
                if(!comments){
                    return []
                }
                return comments;
            } catch (error) {
                throw new Error("Error getting comments by user");
            }
        },

        getCommentsByLoop: async (_: any, { _id}: LoopArgs) => {
            try {
                const loop = await Loop.findById(_id).populate("comments")
                if(!loop){
                    throw new Error("Loop not found!");
                }

                const comments = await Comment.find({loopId: loop._id})
                if(!comments){
                    return []
                }

                return comments
            } catch (error) {
                throw new Error("Error getting comments by Loop");
            }
        },
    },

    Mutation: {
        createComment: async (_: any, {input}: AddCommentArgs, context: any) => {


            const comment = new Comment({
                body: input.body,
                username: input.username,
                userId: context.userId,
                loopId: input.loopId
            });

            await comment.save();
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