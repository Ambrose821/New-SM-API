import express from 'express'
const router = express.Router();
import {
    createInstagramSocialAccount,
    getSocialAccountByInstagramId,
    getSocialAccounts
} from '../models/mappers/socialAccountMapper';
import {get_instagram_id} from '../services/Socials/meta/metaAuth';


const PLATFORM_OPTIONS = ['twitter','facebook','instagram','tiktok','linkedin']

router.get('/', async (req,res) =>{
    try{
        const searchedHandle = req.query.handle as string | '';
        const platformQuery = req.query.platforms as string | 'all';
        let platformFilter : string[];
        platformQuery === 'all' ? platformFilter = PLATFORM_OPTIONS : platformFilter = platformQuery.split(',') as string[];

        const socialAccounts = await getSocialAccounts(searchedHandle, platformFilter);
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
        const {handle, facebookId} = req.body as {handle?: string, facebookId?: string};
        if(!handle || !facebookId){
            return res.status(400).json({message: 'Both Handle and Instagram ID are required'})
        }
        const instagramId = await get_instagram_id(facebookId);
        if(!instagramId){
            return res.status(400).json({message: 'Invalid Facebook Page ID or no associated Instagram account found'})
        }

        // Check if the account already exists
        const existingAccount = await getSocialAccountByInstagramId(instagramId);
        if(existingAccount){
            return res.status(400).json({message: `Instagram account ${handle} already exists`});
        }
        const newAccount = await createInstagramSocialAccount(handle, instagramId);
        res.status(201).json(newAccount);
    }catch(error){
        res.status(500).json({message: 'Error creating social account', error});
    }
})

export default router;
