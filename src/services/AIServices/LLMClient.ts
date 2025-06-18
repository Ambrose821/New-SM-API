import { NewsContent } from "../../types";
import { LLMAgent,GeminiLLMAgent } from "./LLMAgent";

export class LLMClient {
    private LLMAgent : LLMAgent;
    
    constructor(agent : LLMAgent){
        this.LLMAgent = agent
    }

    public async generateNewsContent(inputText: string): Promise<NewsContent|null> {
        
        try{
            //console.log("input: ", inputText)
            const newsContent = await this.LLMAgent.generateNewsContent(inputText);
            return newsContent;
        }catch(error){
            throw new Error("Error in LLMClient at generateNewsContent(): " +error);
        }
    }
}