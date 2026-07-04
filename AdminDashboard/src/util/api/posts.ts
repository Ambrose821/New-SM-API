import api from "../api/api";


const getPosts = async (page:number,limit:number,search:string,sort:string,genre:string,mediaType:string) =>{
    try{
        const response = await api.get('/posts',{
            params:{
                page,
                limit,
                search,
                sort,
                genre,
                mediaType
            }
        });
        return response.data;
    }catch(error){
        console.error("Error fetching posts:", error);
        throw error;
    }
}

const getGenres = async () =>{
    try{
        const response = await api.get('/posts/genres');
        return response.data.genres;
    }catch(error){
        console.error("Error fetching genres:", error);
        throw error;
    }
}

const publishPosts = async (postIds: string[], socialAccountId:string) =>{
    try{
        const response = await api.post('/posts/publish',{postIds:postIds,socialAccountId:socialAccountId})
        return response.data

    }catch(error:any){
        console.error(error.response?.data ?? error.message ?? error)
        return null

    }
}

const deletePosts = async (postIds: string []) =>{
    try{
        //TODO Use the delete data for something? idk yet lol
        await api.delete('/posts', {data: {postIds: postIds}})
        return true
    }catch(error:any){
        console.log(error.message? error.message: error)
        return false
    }
}

export {getPosts,getGenres,publishPosts,deletePosts};
