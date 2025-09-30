import { pipeLineSubscriber } from "./piplineSubscriber";
import postSchema from '../../models/post'
import { Post } from "../../types";
export class mongoSubscriber implements pipeLineSubscriber{

    async handleReceivePost(post: Post): Promise<Post|void> {
        try{

            const newPost = new postSchema(post);
            await newPost.save();
            return newPost;
        }catch(error){
            throw new Error("Error saving mongo post in handleReceivePost: "+error)
        }
    }
}