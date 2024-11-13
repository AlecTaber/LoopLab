import mongoose from "mongoose";
import dotenv from "dotenv";
import connection from "../config/connection.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import users from "./userSeeds.js";
import comments from "./commentSeeds.js";

// Load environment variables
dotenv.config();

async function seedDatabase() {
  // Initialize database connection
  await connection();

  try {

    // Insert users
    const createdUsers = await User.insertMany(users);
    console.log("Users seeded");

    // Link comments to users based on usernames
    const commentsWithUserIds = comments.map((comment) => {
      const user = createdUsers.find((u) => u.username === comment.username);
      return { ...comment, userId: user?._id };
    });

    // Insert comments
    await Comment.insertMany(commentsWithUserIds);
    console.log("Comments seeded");

  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    mongoose.connection.close();
  }
}

// Run seeding
seedDatabase().catch((error) => console.error("Seeding failed:", error));
