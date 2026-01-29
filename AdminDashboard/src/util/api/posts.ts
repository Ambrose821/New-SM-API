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

export {getPosts,getGenres};