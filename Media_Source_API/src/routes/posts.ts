import express from 'express';
const router = express.Router();
import mongoose from 'mongoose';
import Post from '../models/post';
import SocialAccount from '../models/socialAccount';
import { postProducer } from '../queues/postingQueue';

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
        const filter = {
            genre: { $in: genre },
            mediaType: { $in: mediaType },
            $or :[
                {headline : { $regex: search, $options: 'i' }},
                {description : { $regex: search, $options: 'i' }}
            ]
        }
        const posts = await Post.find(filter)
            .sort(sortBy)
            .skip(page * limit)
            .limit(limit).select('-__v').lean();

       const numberOfPosts = await Post.countDocuments(filter)

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

        if (postIds.some((postId) => !mongoose.Types.ObjectId.isValid(postId))) {
            return res.status(400).json({ message: 'All postIds must be valid ids' });
        }

        if (!socialAccountId || !mongoose.Types.ObjectId.isValid(socialAccountId)) {
            return res.status(400).json({ message: 'Valid socialAccountId is required' });
        }

        const uniquePostIds = [...new Set(postIds)];

        const [posts, socialAccount] = await Promise.all([
            Post.find({ _id: { $in: uniquePostIds } }).select('_id posted'),
            SocialAccount.findById(socialAccountId).select('_id platform instagramId handle')
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



export default router;
