import mongoose, {Document, Schema, Types} from "mongoose";
import {ILike, likeSchema} from './Like.js';


export interface IFrame {
    frameId: string;
    canvasImg: string;
}

export interface ILoop extends Document {
    id: string;
    userId: mongoose.Types.ObjectId;
    title: string;
    frames: IFrame[];
    comments: Types.ObjectId[];
    likes: [ILike];
    likeCount: number
    createdAt?: Date;
    updatedAt?: Date; 
}

const frameSchema = new Schema<IFrame>({
    frameId: { type: String, required: true },
    canvasImg: { type: String, required: true },
});

export const loopSchema = new Schema<ILoop>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    frames: [frameSchema],
    comments: [{type: Schema.Types.ObjectId, ref: "Comment"}],
    likes: [likeSchema],
  },
    { timestamps: true }
);


loopSchema.virtual("likeCount").get(function() {
    return this.likes.length
});

const Loop = mongoose.model<ILoop>("Loop", loopSchema)

export default Loop;