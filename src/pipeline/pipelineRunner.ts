import {Media,Genre} from "../types";

import Sourcer from "../services/Sourcing/Sourcer";

import { LLMAgent,GeminiLLMAgent } from '../services/AIServices/LLMAgent'
import { LLMClient } from '../services/AIServices/LLMClient'


/*
    This class acts as the controller for all functionality of the media processing pipeline and will perform all pipeline actions per media source.

*/
export default class PipelineRunner{

    private sourcer : Sourcer;
    private sourceURL : string;
    private genres :Genre[];

    constructor(sourcer: Sourcer, sourceURL: string,genres: Genre[]){
        this.sourceURL = sourceURL;
        this.sourcer = sourcer;
        this.genres = genres;

    }

    public async runPipeline(){
        try{
        //fetch feed
        const mediaObj = await this.sourcer.source(this.sourceURL,this.genres);
        console.log(mediaObj)

        const llmCli = new LLMClient(new GeminiLLMAgent());


        }catch(err){
            console.log("pipelineRunner Error: ", err);
            throw new Error("Error in pipelineRunner runPipeline(): " + err);
        }

    }
        



    

}