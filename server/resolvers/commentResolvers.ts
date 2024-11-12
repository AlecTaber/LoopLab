import Comment, { IComment } from '../models/Comment.js';
import User, { IUser } from '../models/User.js';
//import Post, { IPost } from '../models/Post.js';
import { getUserDataFromToken } from '../utils/auth.js';

const commentResolvers = {
    Query: {
        getCommentsByUser: async (_: any, { userId }: { userId: string }) => {
            try {
                const comments = await Comment.find({ userId });
                return comments;
            } catch (error) {
                throw new Error("Error getting comments by user");
            }
        },

        /*getCommentsByPost: async (_: any, { input }: { input: { body: string } }) => {
            try {
                const comments = await Comment.find({ postId });
                return comments;
            } catch (error) {
                throw new Error("Error getting comments by post");
            }
        },*/
    },

    Mutation: {
        createComment: async (_: any, { input }: { input: { body: string } }) => {
            const { body } = input;

            const user = getUserDataFromToken();
            if (!user) {
                throw new Error("Not authenticated");
            }

            const { userId, username } = user;

            const comment = new Comment({
                body,
                userId,
                username,
            });

            await comment.save();

            /*const post = await Post.findById(comment.postId);
      if (post) {
        post.comments.push(comment._id);
        await post.save();
      }*/

            return comment;
        },

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