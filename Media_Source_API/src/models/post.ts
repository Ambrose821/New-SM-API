import {Schema,model} from 'mongoose'

import{Post} from '../types'

const postSchema = new Schema<Post>({
    headline:{
        type:String,
        unique:true,
        required:true,
    },
    description:{
        type:String,
        unique:true 
    },
    thumbnailUrl:{
        type:String,
        required:false
    },
    videoUrl:{
        type:String,
        required:false
    },
    mediaType:{
        type:String,
        enum:['Video','Image']
    },
    sourcedAt:{
        type:Date,
        default:Date.now
    },
    genre:{
        type:[String],
        enum:['news','politics','sports','memes','humour','finance','crypto'],
        required:false
    },
    imageAttributions:{
        type:[String],
        required:false
    },
    videoAttributions:{
        type:[String],
        required:false
    },
    audioAttributions:{
        type:[String],
        required:false
    },
    posted:{
        type:Boolean,
        default:false

    }

})

postSchema.methods.savePost = async function(post: Post): Promise<Post> {

    try{
        const savedPost = await this.save();
        return savedPost as Post;
    }catch(error){
        throw new Error("Error saving mongo Post object: " + error)
    }
}



export default model<Post>('Post',postSchema)
