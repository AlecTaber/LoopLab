import mongoose, {Document, Schema} from "mongoose";

export interface IFrame {
    frameId: string;
    canvasImg: string;
}

export interface ILoop extends Document {
    userId: string;
    title: string;
    frames: IFrame[];
}

const frameSchema = new Schema<IFrame>({
    frameId: { type: String, required: true },
    canvasImg: { type: String, required: true },
});

const loopSchema = new Schema<ILoop>({
    userId: {type: String, required: true},
    title: { type: String, required: true },
    frames: [frameSchema],
});

const Loop = mongoose.model<ILoop>('Loop', loopSchema);

export default Loop;