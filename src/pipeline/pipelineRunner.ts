import {Media} from "../types";

import Sourcer from "../services/Sourcing/Sourcer";


/*
    This class acts as the controller for all functionality of the media processing pipeline and will perform all pipeline actions per media source.

*/
export default class PipelineRunner{

    private sourcer : Sourcer;
    private sourceURL : string;

    constructor(sourcer: Sourcer, sourceURL: string){
        this.sourceURL = sourceURL;
        this.sourcer = sourcer;
    }

    public async runPipeline(){
        try{
        const mediaObj = await this.sourcer.source(this.sourceURL);
        


        }catch(err){
            console.log("pipelineRunner Error: ", err);
            throw new Error("Error in pipelineRunner runPipeline(): " + err);
        }

    }
        



    

}