import mongoose, {Schema,model} from 'mongoose'
import { PostJob } from '../queues/types'


const postJobSchema = new Schema({
    jobId:{
        type:String,
        required: true,
    },
    socialAccountId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SocialAccount',
        required: true,
    },

    postId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Post',
        required: true
    },
    status:{
        type:String,
        enum:['completed','failed','delayed','active','wait','waiting-children','prioritized','paused','repeat'],
        required: false
    },
    errorMessage:{
        type:String,
        required: false,
    },
        
}, { timestamps: true })


postJobSchema.index({createdAt:1}, {expireAfterSeconds:3600*24*30})


export default model('PostJob',postJobSchema)