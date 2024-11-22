import mongoose, {Document, Schema} from "mongoose";

export interface ILike extends Document {
    id: string;
    userId: mongoose.Types.ObjectId;
    loopId: mongoose.Types.ObjectId;
    commentId: mongoose.Types.ObjectId;
};

export const likeSchema = new Schema<ILike>({
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true },
    loopId: {type: Schema.Types.ObjectId, ref: "Loop"},
    commentId: {type: Schema.Types.ObjectId, ref: "Comment"},
});


