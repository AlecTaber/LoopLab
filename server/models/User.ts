import mongoose, {Document, Schema} from "mongoose";
import bcrypt from 'bcryptjs';

import loop from "./loop.js";
import type { ILoop } from "./loop.js";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  loops: ILoop[];
  isCorrectPassword(password: string): Promise<Boolean>;
  loopCount: number;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  loops: [loop],
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