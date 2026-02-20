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
        required:true
    },
    instagramId:{
        type:String,
        required:false
    }
})
export default model<SocialAccount>('socialAccountScheme',socialAccountSchema)