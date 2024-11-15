import mongoose, {Document, Types, Schema} from "mongoose";

interface Frame {
    frameId: string;
    canvasImg?: string;
    data: {
        data: Uint8ClampedArray;
        colorSpace: string;
        height: number;
        width: number;
    }
}

export interface ILoop extends Document {
    userId: Types.ObjectId,
    loopId: any,
    title: string,
    frames: Frame[]    
}

const frameSchema = new Schema<Frame>({
    frameId: { type: String, required: true },
    canvasImg: { type: String },
    data: {
        data: { type: [Number], required: true }, // Store Uint8ClampedArray as an array of numbers
        colorSpace: { type: String, required: true },
        height: { type: Number, required: true },
        width: { type: Number, required: true }
    }
}); 

const loopSchema = new Schema<ILoop>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    loopId: { type: String, required: true },
    title: { type: String, required: true },
    frames: { type: [frameSchema], required: true } // Array of frames
});

const Loop = mongoose.model<ILoop>("Loop", loopSchema);
export default Loop;