import { pipeLineSubscriber } from "./piplineSubscriber";
import postSchema from '../../models/post'
import { Post } from "../../types";

type MongoDuplicateKeyError = {
    code?: number;
    keyValue?: Record<string, unknown>;
}

export class mongoSubscriber implements pipeLineSubscriber{

    async handleReceivePost(post: Post): Promise<Post|void> {
        try{

            const newPost = new postSchema(post);
            await newPost.save();

            console.log("=================== Saved post to mongo ================:")
            console.log(newPost)
            return newPost;
        }catch(error){
            if (this.isDuplicateKeyError(error)) {
                console.log("Skipping duplicate mongo post", error.keyValue)
                return;
            }

            throw new Error("Error saving mongo post in handleReceivePost: "+error)
        }
    }

    private isDuplicateKeyError(error: unknown): error is MongoDuplicateKeyError {
        return typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as MongoDuplicateKeyError).code === 11000
    }
}
