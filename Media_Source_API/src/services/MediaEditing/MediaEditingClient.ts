import { MediaEditingAgent } from "./MediaEditingAgent"
export class MediaEditingService{
    private mediaEditingAgent : MediaEditingAgent;
    public constructor(mediaEditingAgent:MediaEditingAgent){
        this.mediaEditingAgent =mediaEditingAgent;

    }

}