import mongoose from "mongoose";
import dotenv from "dotenv";
import connection from "../config/connection.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";

// Load environment variables
dotenv.config();

async function cleanDatabase() {
  await connection(); // Connect to the database

  try {
    // Clear data from User and Comment collections
    await User.deleteMany({});
    await Comment.deleteMany({});
    console.log("Database cleaned: All Users and Comments removed");

  } catch (error) {
    console.error("Error cleaning the database:", error);
  } finally {
    mongoose.connection.close(); // Close the connection
  }
}

// Execute the clean-up function
cleanDatabase().catch((error) => console.error("Database clean-up failed:", error));
