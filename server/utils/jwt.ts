import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'thisisasecret';

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined. Set it in your environment variables.");
  }

export const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
    };

    export const verifyToken = (token: string): { userId: string } | null => {
        try {
            return jwt.verify(token, JWT_SECRET) as { userId: string };
        } catch {
            return null; // Return null instead of throwing an error
        }
    };