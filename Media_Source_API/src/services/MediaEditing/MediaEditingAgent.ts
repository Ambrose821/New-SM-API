import e from "express";
import { RenderResponse,RenderRequest } from "../../types";
import axios from "axios";

export interface MediaEditingAgent{

    getBasicImagePost(payLoad:RenderRequest):Promise<RenderResponse>;

}

export class simpleMediaEditingAgent implements MediaEditingAgent{
        private apiURL = 'http://localhost:8000'

        async getBasicImagePost(payLoad:RenderRequest):Promise<RenderResponse>{

            try{
                const response = await axios.post(`${this.apiURL}/render`,payLoad)
                console.log(response.data)
                return response.data;

            }catch(error){
                if (
                    typeof error === "object" &&
                    error !== null &&
                    "message" in error &&
                    "status" in error
                ) {
                    throw new Error("Error in simpleMediaEditingAgent: getBasicImagePost: " + error.message+ ", " + error.status)
                }
                else{
                    throw new Error("Error in simpleMediaEditingAgent: getBasicImagePost: " + error)
                }
                }
            }
           
        }



/*


curl -X POST http://localhost:8000/render \
  -H "Content-Type: application/json" \
  -d '{
    "bg_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    "fg_url": "https://images.unsplash.com/photo-1519125323398-675f0ddb6308",
    "caption": "Breaking News: Market Surges!",
    "highlight": ["news", "market"],
    "category": "Finance",
    "brand": "BrandA",

    "width": 1080,
    "height": 1920,
    "duration": 20,
    "fps": 30,

    "s3_bucket": "mediaapibucket",
    "s3_key": "posts/demo/post.mp4",

    "encoder": "libx264",
    "preset": "medium"
  }'
*/