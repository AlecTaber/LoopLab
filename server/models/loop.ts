import mongoose, {Document, Schema} from "mongoose";

export interface IFrame {
    frameId: string;
    canvasImg: string;
}

export interface ILoop extends Document {
    id: string;
    userId: mongoose.Types.ObjectId;
    title: string;
    frames: IFrame[];
}

const frameSchema = new Schema<IFrame>({
    frameId: { type: String, required: true },
    canvasImg: { type: String, required: true },
});

export const loopSchema = new Schema<ILoop>({
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true},
    title: { type: String, required: true },
    frames: [frameSchema],
});

const Loop = mongoose.model<ILoop>("Loop", loopSchema)

export default Loop;