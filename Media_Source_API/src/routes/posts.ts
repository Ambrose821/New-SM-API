import express from 'express';
const router = express.Router();
import { deletePosts, getPosts, getPostsForDeletion, getPostsForPublishing, isValidPostId } from '../models/mappers/postMapper';
import { getSocialAccountById, isValidSocialAccountId } from '../models/mappers/socialAccountMapper';
import { postProducer } from '../queues/postingQueue';
import { deleteS3Objects } from '../services/AWS/s3Objects';

// TODO Genres should be dynamic based on DB entries
const GENRE_OPTIONS = ['news','politics','sports','memes','humour','finance','crypto','viral','tech'];

router.get('/', async (req,res)=>{
    try{
        const page = Math.max(0, parseInt(req.query.page as string)-1 || 0);
        const limit = Math.max(1,parseInt(req.query.limit as string) || 1);
        const search = req.query.search as string || '';
        const sortQuery = req.query.sort as string || 'sourcedAt';
        let sort : string[];
        const genreQuery = req.query.genre as string || 'all';
        let genre :string[];
        const mediaTypeQuery = req.query.mediaType as string || 'any';
        let mediaType : string[];
        mediaType = mediaTypeQuery ==='any' ? mediaType = ['Video','Image'] : mediaType = mediaTypeQuery.split(',') as string[];


        genreQuery === 'all' ? genre = GENRE_OPTIONS : genre = genreQuery.split(',') as string[];

        let sortBy = {} as any;
        req.query.sort ? (sort = sortQuery.split(",")) : sort = [sortQuery]
        // Expect sort to be 'field,order' e.g., 'sourcedAt,desc'
        if(req.query[1] && (req.query[1] === 'desc' || req.query[1] === 'asc')){
            sortBy[sort[0]] = sort[1]
        }else{
            sortBy[sort[0]] = 'desc'; // Default to descending
        }
        const { posts, numberOfPosts } = await getPosts({
            page,
            limit,
            search,
            sortBy,
            genre,
            mediaType,
        })

       const responseData =  {
            posts: posts,
            numberOfPosts: numberOfPosts
        }

        console.log('Response Data posts size', posts.length);
        console.log('Total posts with filter', numberOfPosts);
        res.status(200).json(responseData);
    }catch(error){
        res.status(500).json({message: 'Error fetching posts', error});
    }
})

router.get('/genres', (req,res)=>{
    try{
        res.status(200).json({genres: GENRE_OPTIONS});
    }catch(error){
        res.status(500).json({message: 'Error fetching posts', error});
    }
})

router.post('/publish', async (req, res) => {
    try{
        const { postIds, socialAccountId } = req.body as { postIds?: string[], socialAccountId?: string };

        if (!Array.isArray(postIds) || postIds.length === 0) {
            return res.status(400).json({ message: 'postIds must be a non-empty array' });
        }

        if (postIds.some((postId) => !isValidPostId(postId))) {
            return res.status(400).json({ message: 'All postIds must be valid ids' });
        }

        if (!socialAccountId || !isValidSocialAccountId(socialAccountId)) {
            return res.status(400).json({ message: 'Valid socialAccountId is required' });
        }

        const uniquePostIds = [...new Set(postIds)];

        const [posts, socialAccount] = await Promise.all([
            getPostsForPublishing(uniquePostIds),
            getSocialAccountById(socialAccountId)
        ]);

        if (posts.length !== uniquePostIds.length) {
            return res.status(404).json({ message: 'One or more posts were not found' });
        }

        if (!socialAccount) {
            return res.status(404).json({ message: 'Social account not found' });
        }

        const alreadyPostedIds = posts
            .filter((post) => post.posted)
            .map((post) => String(post._id));

        if (alreadyPostedIds.length > 0) {
            return res.status(409).json({ message: 'One or more posts have already been published', postIds: alreadyPostedIds });
        }

        if (socialAccount.platform !== 'instagram') {
            return res.status(400).json({ message: `Posting for ${socialAccount.platform} is not supported yet` });
        }

        if (!socialAccount.instagramId) {
            return res.status(400).json({ message: 'Instagram account is missing instagramId' });
        }

        const jobs = await Promise.all(
            uniquePostIds.map((postId) => postProducer({ postId, socialAccountId }))
        );

        res.status(202).json({
            message: 'Posts queued for publishing',
            jobs: jobs.map((job, index) => ({
                jobId: job.id,
                postId: uniquePostIds[index]
            }))
        });
    }catch(error){
        res.status(500).json({message: 'Error queueing post publish', error});
    }
})

router.delete('/', async (req, res) => {
    try{
        const { postIds } = req.body as { postIds?: string[] };

        if (!Array.isArray(postIds) || postIds.length === 0) {
            return res.status(400).json({ message: 'postIds must be a non-empty array' });
        }

        if (postIds.some((postId) => !isValidPostId(postId))) {
            return res.status(400).json({ message: 'All postIds must be valid ids' });
        }

        const uniquePostIds = [...new Set(postIds)];
        const posts = await getPostsForDeletion(uniquePostIds);

        if (posts.length !== uniquePostIds.length) {
            return res.status(404).json({ message: 'One or more posts were not found' });
        }

        const s3Bucket = process.env.MEDIA_BUCKET || process.env.S3_BUCKET || 'mediaapibucket';
        const s3Keys = posts.flatMap((post) => [
            post.thumbnailKey ? String(post.thumbnailKey) : '',
            post.videoKey ? String(post.videoKey) : '',
        ]).filter(Boolean);

        const s3Result = await deleteS3Objects(s3Bucket, s3Keys);

        if (s3Result.errors.length > 0) {
            return res.status(502).json({
                message: 'Error deleting one or more S3 objects',
                errors: s3Result.errors,
            });
        }

        const deleteResult = await deletePosts(uniquePostIds);

        res.status(200).json({
            message: 'Posts deleted',
            deletedPostCount: deleteResult.deletedCount ?? 0,
            deletedS3ObjectCount: s3Result.deleted.length,
            postIds: uniquePostIds,
        });
    }catch(error){
        res.status(500).json({message: 'Error deleting posts', error});
    }
})


export default router;
