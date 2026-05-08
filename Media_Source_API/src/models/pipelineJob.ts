import {Schema, model} from "mongoose"
import type { PipelineJob } from "../queues/types"
import { FalStream } from "@fal-ai/client"
const pipelineJobSchema = new Schema<PipelineJob>({

    jobId: {
        type: String,
        required: true
    },

    pipelineId: {
        type: Schema.Types.ObjectId,
        ref:'Pipeline',
        required:false,
        default:null
    },
      status:{
        type:String,
        enum:['completed','failed','delayed','active','wait','waiting-children','prioritized','paused','repeat'],
        required: false
    },
    errorMessage:{
        type:String,
        required: false,
        default: ''
    },


}, {timestamps: true})

pipelineJobSchema.index({createdAt: 1} , {expireAfterSeconds: 3600 * 24 * 30})

export default model<PipelineJob>("PipelineJob",pipelineJobSchema)