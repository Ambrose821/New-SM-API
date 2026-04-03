import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import Post from '../models/post';
import SocialAccount from '../models/socialAccount';
import { post_to_instagram } from '../services/Socials/meta/metaPosting';

interface PostingJobData {
    postId: string,
    socialAccountId: string
}

const connection = new IORedis({maxRetriesPerRequest:null}); // Defaults connection to localHost 6379

const postingQueue = new Queue<PostingJobData>('posting', {
   connection
});

const postWorker = new Worker<PostingJobData>('posting', async job => {
    console.log(`Processing job ${job.id} with data:`, job.data);

    const { postId, socialAccountId } = job.data;
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

    const result = await post_to_instagram(String(socialAccount.instagramId), post);

    if (!result.success) {
        throw new Error(`Instagram posting failed for post ${postId}`);
    }

    post.posted = true;
    await post.save();

    return result;
},{connection});


export const postProducer = async (jobData: PostingJobData) =>{
    return postingQueue.add('social_media_post',jobData)
}



