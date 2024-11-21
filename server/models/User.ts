import mongoose, {Document, Schema, Types} from "mongoose";
import bcrypt from 'bcryptjs';

// import loop from "./loop.js";
// import type { ILoop } from "./loop.js";

export interface IUser extends Document {
  id: string;
  username: string;
  email: string;
  password: string;
  loops: Types.ObjectId[];
  isCorrectPassword(password: string): Promise<Boolean>;
  loopCount: number;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  loops: [{type: Schema.Types.ObjectId, ref: "Loop"}],
  },
  {
    toJSON: {
      virtuals: true,
    }
  }
);

userSchema.pre<IUser>('save', async function (next) {
  if(this.isNew || this.isModified('password')){
    const saltRounds = 10
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

userSchema.methods.isCorrectPassword = async function (password: string){
  return await bcrypt.compare(password, this.password);
};

//counts the number of loops within the 
userSchema.virtual('loopCount').get(function() {
  return this.loops.length;
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;