import { pipeLineSubscriber } from "./piplineSubscriber";

import { Post } from "../../types";

export class consoleLogSubscriber implements pipeLineSubscriber{

    async handleReceivePost(post:Post):Promise<Post|void>{
            console.log("===============================================")
            console.log(post)
            console.log("===============================================")
    }
}