import mongoose, {Document, Schema} from "mongoose";

export interface ILike extends Document {
    userId: mongoose.Types.ObjectId;
};

export const likeSchema = new Schema<ILike>({
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true },
});

