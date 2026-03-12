import api from '../api/api';

export const getSocials = async (platforms:string,handle:string ) =>{
    try{
        const response = await api.get('/socials',{params:{platforms,handle}});
        return response.data.socialAccounts;
    }catch(error){
        console.error("Error fetching socials:", error);
        throw error;
    }
}

export const getSocialPlatforms = async () =>{
    try{
        const response = await api.get('/socials/platforms');
        return response.data.platforms;
    }catch(error){
        console.error("Error fetching social platforms:", error);
        throw error;
    }
}

export const createInstagramAccount = async (handle: string, facebookId: string) =>{
    try{
        const response = await api.post('/socials/instagram',{handle, facebookId});
        return response.data;
    }catch(error){
        console.error("Error creating Instagram account:", error);
        throw error;
    }
}
