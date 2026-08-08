import {Schema, model} from 'mongoose'
import {SocialAccount} from '../types'


const socialAccountSchema = new Schema<SocialAccount>({
    platform:{
        type:String,
        enum:['twitter','facebook','instagram','tiktok','linkedin'],
        required:true
    },
    handle:{
        type:String,
        required:true,
        unique:true
    },
    instagramId:{
        type:String,
        required:false
    },
    instagramToken: {
        type:String,
        required:false
    },
    authExpiresAt: {
        type: Date,
        required: false
    }
    
})
export default model<SocialAccount>('SocialAccount',socialAccountSchema)
