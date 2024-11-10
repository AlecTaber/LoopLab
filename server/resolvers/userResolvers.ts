import bycrypt from 'bcryptjs';
import User, { IUser } from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

const userResolvers = {
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
                return {token, user: newUser};
    },

        login: async (_: any, { username, password }: IUser) => {
            const user = await User.findOne({ username });
            if (!user) {
                throw new Error("User not found");
            }
            const passwordMatch = await bycrypt.compare(password, user.password);
            if (!passwordMatch) {
                throw new Error("Invalid password");
            }
            const token = generateToken(user.id.toString());
            return { token, user };
        }
    }
};

export default userResolvers;