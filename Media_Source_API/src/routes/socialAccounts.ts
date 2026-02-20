import express from 'express'
const router = express.Router();
import SocialAccount from '../models/socialAccount';

const PLATFORM_OPTIONS = ['twitter','facebook','instagram','tiktok','linkedin']

router.get('/', async (req,res) =>{
    try{
        const searchedHandle = req.query.handle as string | '';
        const platformQuery = req.query.platform as string | 'all';
        let plaroformFilter : string[];
        platformQuery === 'all' ? plaroformFilter = PLATFORM_OPTIONS : plaroformFilter = platformQuery.split(',') as string[];

        const filter = {
            platform : {$in: plaroformFilter},
            handle : {$regex: searchedHandle, $options: 'i'}
        }

        const socialAccounts = await SocialAccount.find(filter).select('-__v').lean();
        res.status(200).json({socialAccounts: socialAccounts})
    }
    catch(error){
        res.status(500).json({message: 'Error fetching social accounts', error});
    }
})

router.get('/platforms', (req,res)=>{
    try{
        res.status(200).json({platforms: PLATFORM_OPTIONS})
    }catch(error){
        res.status(500).json({message: 'Error fetching platforms', error});
    }
})

router.post('/instagram', async (req, res) =>{
    try{
        const {handle, instagramId} = req.body as {handle: string, instagramId: string};
        if(!handle || !instagramId){
            return res.status(400).json({message: 'Both Handle and Instagram ID are required'})
        }
        const newAccount = new SocialAccount(
            {platform: 'instagram',
            handle: handle,
            instagramId: instagramId
        })
    }catch(error){
        res.status(500).json({message: 'Error creating social account', error});
    }
})

export default router;