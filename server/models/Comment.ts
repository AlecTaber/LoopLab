import mongoose, {Document, Types, Schema} from "mongoose";
import {ILike, likeSchema} from './Like.js'

export interface IComment extends Document {
  id: string;
  username: string;
  body: string;
  //References to models to help link Mongo models
  userId: Types.ObjectId;
  loopId: Types.ObjectId;
  likes: [ILike];
}

const commentSchema = new Schema<IComment>({
    username: { type: String, required: true },
    body: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    loopId: { type: Schema.Types.ObjectId, ref: "Loop", required: true },
    likes: [likeSchema]
});

commentSchema.virtual("likeCount").get(function() {
  return this.likes.length
})

const Comment = mongoose.model<IComment>('Comment', commentSchema);

export default Comment;