import mongoose, {Schema,model} from 'mongoose'

import {Pipeline} from '../types'

const imageSourceConfigSchema = new Schema(
    {
        strategy: {
            type: String,
            enum: ['openverse', 'pixabay', 'falAI', 'wikicommons', 'runware'],
            required: true,
        },
        model: {
            type: String,
            required: false,
            default: null,
        },
        systemPrompts: {
            type: [String],
            required: false,
            default: undefined,
        },
    },
    { _id: false }
)

const llmConfigSchema = new Schema(
    {
        agent: {
            type: String,
            enum: ['gemini-2.5-flash'],
            required: true,
        },
        model: {
            type: String,
            required: false,
            default: null
        },
    },
    { _id: false }
)

const pipelineSchema = new Schema<Pipeline>({
        name:{
            type:String,
            required:true,
            trim:true
        },
        description:{
            type:String,
            required:false,
            default:null
        },
        source:
        {
            type:String,
            enum:['rssApp', 'newsIO', '9gag'],
            required:true
        },
        source_url:{
            type: String,
            required:false,
            default: null
        },
        genre:{
           type:[String],
            enum:['news','politics','sports','memes','humour','finance','crypto','viral', 'tech'],
            default: ['viral']
        },
        frequency:{
            type: String,
            required: false,
            enum:['daily','weekly','monthly',""],
        },
        backgroundImageSource:{
            type:imageSourceConfigSchema,
            required:true
        },
        foregroundImageSource:{
            type:imageSourceConfigSchema,
            required:false,
            default:null
        },
        llm:{
            type:llmConfigSchema,
            required:false
        },
        socialAccountId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SocialAccount',
            required:false,
            default:null
        },
        isActive:{
            type:Boolean,
            required:false,
            default:true
        },
        
}, { timestamps: true })
export default model<Pipeline>('Pipeline',pipelineSchema)
