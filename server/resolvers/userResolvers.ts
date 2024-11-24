import bycrypt from 'bcryptjs';
import User, { IUser } from '../models/User.js';
import Loop from '../models/loop.js';
import { LikeArgs } from './likeResolvers.js';
import { LoopArgs } from './loopResolvers.js';
import { CommentArgs } from './commentResolvers.js';
import { generateToken } from '../utils/jwt.js';

export interface UserLikeArgs {
    loop: [LikeArgs],
    comment: [LikeArgs]
}

interface UserArgs {
    _id: any,
    username: string,
    email: string,
    loops: [LoopArgs],
    comments: [CommentArgs],
    likes: UserLikeArgs,
    loopCount: number
}

const userResolvers = {
    Query: {
        me: async (_: any, __: any, context: any) => {
            if (!context.userId) {
                throw new Error("Not authenticated");
            }

            const user = await User.findById(context.userId).populate('loops').populate("comments");
            console.log("User:", user)

            if (!user) {
                throw new Error("User not found");
            }
            return user;
        },
        getUserbyId: async (_parent: any, {_id}: UserArgs ) => {
            return User.findById(_id).populate("loops").populate("comments");
        },
        getUserByLoop: async (_parent: any, {_id}: LoopArgs) => {
            try {
                const loop = await Loop.findById(_id);
                if (!loop) {
                    throw new Error("Loop not found");
                }
    
                const user = await User.findById(loop.userId).populate('loops').populate("comments");
                if (!user) {
                    throw new Error("User not found");
                }
                
                return user;

            } catch (error) {
                console.error("Error in getUserByLoop:", error);
                throw new Error("Failed to fetch user by loop ID");
            }
        },
        
    },

    Mutation: {
        register: async (_: any, { username, email, password }: IUser) => {
            const existingUser = await User.findOne({
                $or: [
                    { username },
                    { email }
                ],
            });
            if (existingUser) {
                if (existingUser.email === email) {
                    throw new Error("Email is already in use");
                }
                if (existingUser.username === username) {
                    throw new Error("Username is already in use");
                }
            };
            
            const newUser = new User({
                username,
                email,
                password
            });
            await newUser.save();
            const token = generateToken(newUser.id.toString());
            return { token, user: newUser };
        },

        login: async (_: any, { email, password }: { email: string; password: string }) => {
            const normalizedEmail = email.toLowerCase();
            console.log("Attempting to log in with email:", normalizedEmail);
        
            // Test querying MongoDB directly
            const testUser = await User.findOne({ email: normalizedEmail });
            console.log("Direct query result:", testUser);  // Check if MongoDB returns any result at all
        
            if (!testUser) {
                console.log("User not found with email:", normalizedEmail);
                throw new Error("User not found");
            }
        
            const passwordMatch = await bycrypt.compare(password, testUser.password);
            if (!passwordMatch) {
                console.log("Password does not match for user:", testUser.username);
                throw new Error("Invalid password");
            }
        
            const token = generateToken(testUser.id.toString());
            return { token, user: testUser };
        },
        
        updateUsername: async (_parent: any, { userId, username }: { userId: string, username: string }) => {
            try {
              const updatedUser = await User.findByIdAndUpdate(
                userId, // The user ID to update
                { username }, // The new username
                { new: true, runValidators: true } // Options to return the updated user and validate
              );
          
              if (!updatedUser) {
                throw new Error("User not found");
              }
          
              return updatedUser;
            } catch (error) {
              console.error("Error updating username:", error);
              throw new Error("Failed to update username");
            }
          }
        
    }
};

export default userResolvers;