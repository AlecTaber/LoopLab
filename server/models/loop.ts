import { any } from "cypress/types/bluebird";
import mongoose, {Document, Types, Schema} from "mongoose";

export interface ILoop extends Document {
    userId: Types.ObjectId,
    loopId: any,
    title: string,
    frames: {
        frameId: any,
        canvasImg?: string,
        data: any 
    }
}

const loopSchema = new Schema<ILoop>({
    userId: { type:Schema.Types.ObjectId, ref: "User", required: true},
    loopId: { type: Number, required: true},
    title: { type: String, required: true},
    frames: {
        frameId: {type: Number, required: true},
        canvasImg: {type: String, required: false},
        data: {type: any, required: true}
    }
});

const Loop = mongoose.model<ILoop>("Loop", loopSchema);

export default Loop;