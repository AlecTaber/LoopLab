import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'thisisasecret';

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined. Set it in your environment variables.");
}

export const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
};

export const verifyToken = (token: string): { user: {userId: string } } | null => {
    try {
        return jwt.verify(token, JWT_SECRET, {maxAge: '1h'}) as { user: {userId: string}};
    } catch (err: any){
        console.error("Token not working,", err)
        return null; // Return null instead of throwing an error
    }
};