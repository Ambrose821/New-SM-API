import { RenderResponse,RenderRequest } from "../../types";

export interface MediaEditingAgent{

    getBasicImagePost(payLoad:RenderRequest):Promise<RenderResponse>;

}

export class simpleMediaEditingAgent implements MediaEditingAgent{
        async getBasicImagePost(payLoad:RenderRequest):Promise<RenderResponse>{
            return {
                  video_url: null,
                  image_url:null,
                  details:null
                
            };
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