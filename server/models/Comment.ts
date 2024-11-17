import mongoose, {Document, Types, Schema} from "mongoose";

export interface IComment extends Document {
  username: string;
  body: string;
  //References to models to help link Mongo models
  userId: Types.ObjectId;
  //loopId: Types.ObjectId;
}

const commentSchema = new Schema<IComment>({
    username: { type: String, required: true },
    body: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    //loopId: { type: Schema.Types.ObjectId, ref: "Loop", required: true },
    });

const Comment = mongoose.model<IComment>('Comment', commentSchema);

export default Comment;