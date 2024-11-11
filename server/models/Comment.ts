import mongoose, {Document, Types, Schema} from "mongoose";

export interface IComment extends Document {
  username: string;
  comment: string;
  //References to models to help link Mongo models
  userId: Types.ObjectId;
  //postId: Types.ObjectId;
}

const commentSchema = new Schema<IComment>({
    username: { type: String, required: true },
    comment: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    //postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    });

const Comment = mongoose.model<IComment>('Comment', commentSchema);

export default Comment;