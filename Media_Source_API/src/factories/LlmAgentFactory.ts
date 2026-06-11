import type { LLMAgentType } from "../types";
import { GeminiLLMAgent, LLMAgent } from "../services/LlmServices/LLMAgent";
import { InvestigateAgent } from "../services/LlmServices/InvestigateAgent"

const llmAgentFactory: Record<LLMAgentType, () => LLMAgent> ={
    'gemini-2.5-flash': () => new GeminiLLMAgent('gemini-2.5-flash'),
    'gemini-3-flash-preview':() => new GeminiLLMAgent('gemini-3-flash-preview'),
    'investigate-api': () => new InvestigateAgent()

}

export const createLLMAgent = (value: LLMAgentType) => {
    const agent = llmAgentFactory[value]
    
    if(!agent){
        throw new Error("Error Creating LLMAgent for Agent type: " + value)
    }
    return agent()
}
