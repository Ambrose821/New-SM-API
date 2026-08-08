import express from 'express'
import type { Request, Response } from 'express';
const router = express.Router();
import {
    createInstagramSocialAccount,
    getSocialAccountByInstagramId,
    getSocialAccounts
} from '../models/mappers/socialAccountMapper';
import { get_instagram_auth_data} from '../services/Socials/meta/instagramAuth';
import { InstagramAuthData } from '../types';


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


router.get('/instagram', async (req: Request, res: Response) =>{
    try{
       const code = req.query.code?.toString() ?? ''

       if(!code){
        return res.status(400).json({message:'No access code provided'});
       }

       const instagramAuthData: InstagramAuthData = await get_instagram_auth_data(code);
       const existingAccount = await getSocialAccountByInstagramId(instagramAuthData.instagram_id)

       if(existingAccount){
        //update account token only
       }
       const newAccount = await createInstagramSocialAccount(instagramAuthData);

       return res.status(200).json({account: newAccount})
       
    }catch(error){
        const metaDetails = (error as { meta?: {
            code?: unknown;
            subcode?: unknown;
            fbtraceId?: unknown;
            requestId?: unknown;
        }}).meta

        console.error('Error creating Instagram social account:', error);

        return res.status(502).json({
            message: 'Instagram connection failed',
            metaCode: metaDetails?.code,
            metaSubcode: metaDetails?.subcode,
            traceId: metaDetails?.fbtraceId,
            requestId: metaDetails?.requestId,
        });
    }
})

export default router;
