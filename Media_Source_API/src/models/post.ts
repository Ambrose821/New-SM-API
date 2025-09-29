import {Schema,model} from 'mongoose'

import{Post} from '../types'

const post = new Schema<Post>({
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
    }

})

export default model<Post>('Post',post)