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

export const connectInstagramAccount = async (code: string) =>{
    try{
        const response = await api.get('/socials/instagram',{ 
            params : {
                code: code,
            }
        });

        return response.data;
    }catch(error: any){
        console.error("Error connecting Instagram account:", error.response?.message);
        throw error;
    }
}
