import User from "../models/User.js";
import Loop from "../models/Loop.js";
import Comment from "../models/Comment.js";
import { Query } from "mongoose";

import { CommentArgs } from "./commentResolvers.js";
import { LoopArgs } from "./loopResolvers.js";

export interface LikeArgs {
    userId: any
}

const likeResolvers = {
    Mutation: {
        addLikeToLoop: async (_:any, {_id}: LoopArgs, context: any) => {
            try {
                //first check if like already exists under the user'

                //if so then remove the like

                //if not then add like

            } catch (err: any){
                console.error("Error adding like to loop!", err)
                throw new Error("Error adding like.")
            }
        },
        addLikeToComment: async (_:any, {_id}: CommentArgs, context: any) => {
            try {

            } catch (err: any){
                console.error("Error adding like to Comment!", err)
                throw new Error("Error adding like.")
            }
        }
    }
};

export default likeResolvers;