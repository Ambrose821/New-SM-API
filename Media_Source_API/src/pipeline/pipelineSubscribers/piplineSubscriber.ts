
import {Post} from '../../types'

/*
* Subscriber interface fro observer method. Publisher or 'subject' is the pipeline runner, 
* Which should update subscribers with a new post object. 
* A post may not simply be saved to a db, it could be sent to another server, or client, etc.
* This leaves the action when a post is created open for extension
*/
export interface pipeLineSubscriber{

    handleReceivePost(post:Post):Promise<Post|void>;

}

