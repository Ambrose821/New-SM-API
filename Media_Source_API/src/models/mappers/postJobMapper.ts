
import { isNull } from 'util';
import { PostJob } from '../../queues/types'
import postJob from '../postJob';


export function toPostJob(doc: any): PostJob {
  return {
    jobId: doc.jobId,
    socialAccountId: doc.socialAccountId.toString(),
    postId: doc.postId.toString(),
    errorMessage:null,
    status: doc.status
  };
}


export async function createJob(job: PostJob){
    const newJob = new postJob({
        jobId: job.jobId,
        socialAccountId:job.socialAccountId,
        postId:job.postId,
        status:'active'
    })
    await newJob.save()
}

export async function updateJob(jobId: string,status:string, errorMessage: string | null = null){
    await postJob.updateOne({jobId:jobId},{ $set:{
        status,
        errorMessage
    }})
}

