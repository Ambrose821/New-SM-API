import {Schema,model} from 'mongoose'

import {Pipeline} from '../types'

const pipelineSchema = new Schema<Pipeline>({
        source:
        {
            type:String,
            enum:['rssApp', 'newsIO', '9gag']
        },
        source_url:{
            type: String,
            required:true
        },
        genre:{
           type:[String],
            enum:['news','politics','sports','memes','humour','finance','crypto','viral'],
            default: ['viral']
        },
        frequency:{
            type: String,
            enum:['daily','weekly','monthly'],
            default:'daily'
        }
        
})
export default model<Pipeline>('Pipeline',pipelineSchema)

