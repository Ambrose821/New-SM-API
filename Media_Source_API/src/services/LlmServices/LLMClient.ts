import { NewsContent } from "../../types";
import { LLMAgent } from "./LLMAgent";
import type { LlmRequest } from "../../types"

export class LLMClient {
    private LLMAgent : LLMAgent;
    
    constructor(agent : LLMAgent){
        this.LLMAgent = agent
    }

    public async generateNewsContent(request: LlmRequest): Promise<NewsContent|null> {
        
        try{
            //console.log("input: ", inputText)
            const newsContent = await this.LLMAgent.generateNewsContent(request);
            return newsContent;
        }catch(error){
            throw new Error("Error in LLMClient at generateNewsContent(): " +error);
        }
    }
}