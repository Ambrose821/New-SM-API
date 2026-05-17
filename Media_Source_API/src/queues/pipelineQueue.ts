import { Job, Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'
import PipelineRunner from '../pipeline/pipelineRunner'
import {createJob, updateJob} from "../models/mappers/pipelineJobMapper"
import { mongoSubscriber } from '../pipeline/pipelineSubscribers/mongoSubscriber'
import { PipelineJob, PipelineRunJobData } from './types'

const connection = new IORedis({
    host: process.env.REDIS_HOST || 'cache',
    port: Number(process.env.REDIS_PORT || 6379),
    maxRetriesPerRequest:null
})


const pipelineQueue = new Queue<PipelineRunJobData>('pipeline', {
    connection
})


const pipelineWorker = new Worker<PipelineRunJobData>('pipeline', async job =>{
    const { pipeline, quantity } = job.data
    const pipelineRunner = new PipelineRunner(pipeline, quantity)
   pipelineRunner.addSubscriber(new mongoSubscriber())
    await pipelineRunner.runPipeline()
},{connection})

pipelineWorker.on('completed', async (job) =>{
    await updateJob(job!.id!,'completed')
})

pipelineWorker.on('failed', async (job, err)=>{
    await updateJob(job!.id!, 'failed',err.message)
    await job!.remove()
})

export const pipelineJobProducer = async (jobData: PipelineRunJobData ) : Promise<Job<PipelineRunJobData>> =>{
    const job = await pipelineQueue.add('pipeline_run',jobData,{
        removeOnComplete:true,
        removeOnFail:false
    })

    const jobId = job.id!
    const pipelineId = String(jobData.pipeline.id)
    await createJob({
        jobId: jobId,
        pipelineId:pipelineId as String
    } as PipelineJob)

    return job
}
