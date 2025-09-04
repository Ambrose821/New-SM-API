import { RenderRequest, RenderResponse } from "../../types";
import { MediaEditingAgent } from "./MediaEditingAgent"


/*
This class is the "Context" with respect to the Media Editing Strategy pattern implementation. 
The Strategy is the MediaEditingAgent
*/
export class MediaEditingService{
    private mediaEditingAgent : MediaEditingAgent;

    public constructor(mediaEditingAgent:MediaEditingAgent){
        this.mediaEditingAgent =mediaEditingAgent;

    }

    public async generateSimplePost(payLoad:RenderRequest): Promise<RenderResponse>{

        const response : RenderResponse = await this.mediaEditingAgent.getBasicImagePost(payLoad);

        return response;

    

    }





}