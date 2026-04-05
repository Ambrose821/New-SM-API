import {Schema,model} from 'mongoose'

import{Post} from '../types'

const hasRequiredMediaForType = function (this: Post) {
    if (this.mediaType === 'Video') {
        return Boolean(this.videoUrl)
    }

    if (this.mediaType === 'Image') {
        return Boolean(this.thumbnailUrl)
    }

    return true
}

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
        enum:['news','politics','sports','memes','humour','finance','crypto','viral', 'tech'],
        default: ['viral']
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

    },

})

postSchema.pre('validate', function(next) {
    if (!hasRequiredMediaForType.call(this)) {
        const missingField = this.mediaType === 'Video' ? 'videoUrl' : 'thumbnailUrl'
        this.invalidate(missingField, `${missingField} is required when mediaType is ${this.mediaType}.`)
    }

    next()
})

export default model<Post>('Post',postSchema)
