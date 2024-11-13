import { IUser } from "../models/User.js";

const users: Partial<IUser>[] = [
  {
    username: "user1",
    email: "user1@example.com",
    password: "password123", // Ensure this matches any hashing logic if required
  },
  {
    username: "user2",
    email: "user2@example.com",
    password: "password123",
  },
  // Additional users as needed
];

export default users;
