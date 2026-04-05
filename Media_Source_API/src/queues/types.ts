export type JobStatus = 'completed' | 'failed' | 'delayed' | 'active' | 'wait' | 'waiting-children' | 'prioritized' | 'paused' | 'repeat'



export interface PostJob {
    jobId: string,
    socialAccountId:string,
    postId:string
    status: JobStatus,
    errorMessage: string | null
}

