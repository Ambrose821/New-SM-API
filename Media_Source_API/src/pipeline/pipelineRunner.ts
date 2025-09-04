import {Media,Genre, RenderRequest, RenderResponse} from "../types";

import Sourcer from "../services/Sourcing/Sourcer";

import { LLMAgent,GeminiLLMAgent } from '../services/AIServices/LLMAgent'
import { LLMClient } from '../services/AIServices/LLMClient'
import { OpenverseClient } from "../services/ImageAndVideoSource/openVerseClient";
import PixabayClient from "../services/ImageAndVideoSource/pixaBayClient";
import { MediaEditingClient } from "../services/MediaEditing/MediaEditingClient";

/*
    This class acts as the controller for all functionality of the media processing pipeline and will perform all pipeline actions per media source.

*/
export default class PipelineRunner{

    private sourcer : Sourcer;
    private sourceURL : string;
    private genres :Genre[];
    private mediaEditingClient: MediaEditingClient;
    private llmCli: LLMClient;

    constructor(sourcer: Sourcer,llmCli:LLMClient,mediaEditingClient: MediaEditingClient, sourceURL: string,genres: Genre[]){
        this.sourceURL = sourceURL;
        this.sourcer = sourcer;
        this.llmCli = llmCli;
        this.mediaEditingClient =mediaEditingClient
        this.genres = genres;
        

    }

    public async runPipeline(){
        try{
        //fetch feed
       
        const mediaObjArr :Media[]|null = await this.sourcer.source(this.sourceURL,this.genres);
        //console.log(mediaObjArr)
        if(!mediaObjArr){
            throw new Error('Error in runPipeline: mediaObjArr is undefined')
        }
        
        await Promise.all(
            mediaObjArr.map(media => this.perMediaPipeline(media))
        )
       

        }catch(err){
            console.log("pipelineRunner Error: ", err);
            throw new Error("Error in pipelineRunner runPipeline(): " + err);
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

    public async perMediaPipeline(mediaObj: Media){

        try {

            
            const promptStr = mediaObj.headline + " " + mediaObj.textSnippet;

            const newsContent = await this.llmCli.generateNewsContent(promptStr)
            
            
            const keywords = newsContent?.keywords;
            if(!keywords){
                throw new Error("Error in pipelineRunner: AI Agent did not generate any keywords")
            }
           
            const openverseCli = new OpenverseClient()
            const pixabayCli = new PixabayClient()
            const imageDataArr = await Promise.all(
            keywords.map(async (word,index) => {
                if(index ==0){
                return await openverseCli.getImagesFromKeyWord(1, word as string);
                }else if(index ==1){
                    return await pixabayCli.getImagesFromKeyWord(1,word as string)
                }else{
                    return
                }
            })
            );

          
          console.log("------------------------------------------------------------------");
          console.log(newsContent)
          console.log(imageDataArr)
          console.log("------------------------------------------------------------------")
         const mediaEditingPayload = {
            bg_url: imageDataArr[1]?.url ?? "" as String,
            fg_url: imageDataArr[0]?.url ?? "" as String,
            caption: newsContent.headline,
            highlight: newsContent.highlightWords,
            category: this.genres[0],
            brand: "",
            width: 1080,
            height: 1920,
            duration: 20,
            fps: 30,
            audio_path:"audio.mp3",
            s3_bucket: "mediaapibucket",
            s3_key: `posts/${Date.now()}/post.mp4`,
            encoder: "libx264",
            preset: "medium"
        } as RenderRequest

        const renderResponse: RenderResponse = await this.mediaEditingClient.generateSimplePost(mediaEditingPayload) 

        } catch (error) {
            throw new Error("Error in pipelineRunner perMediaPipeline(): " + error)
        }


    }
        



    

}