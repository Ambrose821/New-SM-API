import express from 'express';
const router = express.Router();
import Post from '../models/post';


const GENRE_OPTIONS = ['news','politics','sports','memes','humour','finance','crypto','viral'];
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
        res.status(200).json(posts);
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



export default router;