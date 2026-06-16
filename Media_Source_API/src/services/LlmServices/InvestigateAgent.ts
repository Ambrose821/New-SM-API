
import { LLMAgent } from './LLMAgent'
import type { NewsContent, LlmRequest } from '../../types'
/*
* It would be wise to slim down this api by removing The LLM Agent and client and delegate 
* solely to the new Ai MediaInvestigator
*/

const INVESTIGATE_API_URL = process.env.MEDIA_INVESTIGATE_URL || ""
const MEDIA_INVESTIGATE_KEY = process.env.MEDIA_INVESTIGATE_KEY || ""
export class InvestigateAgent implements LLMAgent{

    async generateNewsContent(request: LlmRequest):Promise<NewsContent| null>{
        const url = request.url
        if (!url){
            throw new Error("Investigate agent did not recieve a url")
        }
        const newsContent = await this.getPostContentFromUrl(url)
        return newsContent
    }

    private async getPostContentFromUrl(url:string):Promise<NewsContent | null>{
        const payload = {
            url: url,
            //TODO, Maybe allow system prompt choice upon running a pipeline
        }
        try{
            const resposne = await fetch(`${INVESTIGATE_API_URL}/post_content/generate_text_material`,
                {
                    method: "POST",
                    headers:{
                        "Content-Type":"application/json",
                        "X-API-KEY":MEDIA_INVESTIGATE_KEY,
                    },
                    body: JSON.stringify(payload)
                }
            )

            if (!resposne.ok){
                const data = await resposne.json()
                console.log(JSON.stringify(data))
                throw new Error("HTTP Error in InvestigateAgent: " + data)
            }

            const data = await resposne.json()
            // console.log(data)

            return {
                headline: data.headline || "" as string,
                summary: data.caption || "" as string,
                highlightWords: [] as string[],
                keywords: data.keywords,
                diffusion_prompts: data.diffusion_prompts || [] as string[]
            } as NewsContent
        } catch (error: any){
            throw new Error("Error in InvestigateAgent: " + error);  
        }
    }
    
}
