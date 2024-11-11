import bycrypt from 'bcryptjs';
import User, { IUser } from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

const userResolvers = {
    Query: {
        me: async (_: any, __: any, { userId }: { userId: string }) => {
            if (!userId) {
                throw new Error("Not authenticated");
            }
            const user = await
                User.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            return user;
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
            const hashedPassword = await bycrypt.hash(password, 12);
            const newUser = new User({
                username,
                email,
                password: hashedPassword,
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
        }
        
        
    }
};

export default userResolvers;