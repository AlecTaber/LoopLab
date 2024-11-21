import mongoose, {Document, Types, Schema} from "mongoose";
import {ILike, likeSchema} from './Like.js'

export interface IComment extends Document {
  id: string;
  body: string;
  username: string;
  //References to models to help link Mongo models
  userId: Types.ObjectId;
  loopId: Types.ObjectId;
  likes: [ILike];
  likeCount: number
}

const commentSchema = new Schema<IComment>({
    username: { type: String, required: true },
    body: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    loopId: { type: Schema.Types.ObjectId, ref: "Loop", required: true },
    likes: [likeSchema],
    likeCount: {type: Number, default: 0}
});

commentSchema.virtual("virtualLikeCount").get(function() {
  return this.likes.length
})

const Comment = mongoose.model<IComment>('Comment', commentSchema);

export default Comment;