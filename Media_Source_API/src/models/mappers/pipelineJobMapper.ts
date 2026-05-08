import type { PipelineJob } from "../../queues/types";
import pipelineJob from "../pipelineJob"



const toPipelineJob = (doc: any): PipelineJob =>{
    const pipelineJob = {
        jobId: doc.jobId,
        pipelineId: doc.pipelineId,
        status: doc.status,
        errorMessage: doc.errorMessage
    } as PipelineJob

    return pipelineJob
}


export const createJob = async (job: PipelineJob) =>{
    const newJob = new pipelineJob({
        jobId: job.jobId,
        pipelineId: job.pipelineId,
        status: 'active',
    })
    await newJob.save()
}

export const updateJob = async (jobId: string,status:string, errorMessage: string | '' = '') => {
    await pipelineJob.updateOne({jobId:jobId}, {$set: {
        status: status,
        errorMessage: errorMessage
    }})
}
