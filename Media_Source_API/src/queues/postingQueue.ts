import { Job, Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import Post from '../models/post';
import SocialAccount from '../models/socialAccount';
import { post_to_instagram } from '../services/Socials/meta/metaPosting';
import { createJob, updateJob } from '../models/mappers/postJobMapper';
import { PostJob } from './types';
import { decryptValue } from '../security/encryption';
interface PostingJobData {
    postId: string,
    socialAccountId: string,
    encryptedAuthToken: string | null
}

const connection = new IORedis({
    host: process.env.REDIS_HOST || 'cache',
    port: Number(process.env.REDIS_PORT || 6379),
    maxRetriesPerRequest:null
});

const postingQueue = new Queue<PostingJobData>('posting', {
   connection
});

// TODO Make platform agnostic.
const postWorker = new Worker<PostingJobData>('posting', async job => {
    const { postId, socialAccountId, encryptedAuthToken } = job.data;
    console.log(`Processing job ${job.id}`, { postId, socialAccountId });
    
    //TODOD use mapper and not the direct model FFS
    const post = await Post.findById(postId);
    if (!post) {
        throw new Error(`Post ${postId} not found`);
    }

    const socialAccount = await SocialAccount.findById(socialAccountId);
    if (!socialAccount) {
        throw new Error(`Social account ${socialAccountId} not found`);
    }

    if (socialAccount.platform !== 'instagram') {
        throw new Error(`Unsupported platform ${socialAccount.platform}`);
    }

    if (!socialAccount.instagramId) {
        throw new Error(`Instagram account ${socialAccountId} is missing instagramId`);
    }

    if (!encryptedAuthToken) {
        throw new Error(`Instagram account ${socialAccountId} is missing auth token`);
    }

    const accessToken = decryptValue(encryptedAuthToken);
    const result = await post_to_instagram(String(socialAccount.instagramId), accessToken, post);

    if (!result.success) {
        throw new Error(`Instagram posting failed for post ${postId}`);
    }

    post.posted = true;
    await post.save();

    return result;
},{connection});

postWorker.on('completed',async (job) =>{
    await updateJob(job.id!,'completed')
    
})

postWorker.on('failed',async (job,err) =>{
    await updateJob(job!.id!,'failed',err.message)
    await job!.remove()
})


export const postProducer = async (jobData: PostingJobData): Promise<Job<PostingJobData>> =>{
    const job = await postingQueue.add('social_media_post',jobData,{
        removeOnComplete:true,
        removeOnFail:false,

    })
    const jobId = job.id!
    const socialAccountId = jobData.socialAccountId
    const postId = jobData.postId

    await createJob({
        jobId,
        socialAccountId,
        postId
    } as PostJob).catch((error) => {
        console.error(`Failed to persist post job ${jobId}, but the job was already queued`, error)
    })
    return job
}
