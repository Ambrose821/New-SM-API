import { ImageData } from "../../types";
import { ImageSourceRequest, ImageSourceStrategy } from "./imageSourceStrategy";
import  { fal } from "@fal-ai/client";


import { getSecretValue } from "../../config/secrets-manager"
import { existsSync, readFileSync } from 'fs'
import path from 'path'

export interface FalAIClientOptions {
    modelName?: string;
    systemPrompt?: string;
}

export class FalAIClient implements ImageSourceStrategy {
    private modelName: string;
    private systemPrompt: string;
    private falApiKey: string | null = null;

    public constructor(options: FalAIClientOptions = {}) {
        this.modelName = options.modelName ?? "fal-ai/flux/schnell";
        this.systemPrompt = options.systemPrompt ?? this.getDefaultSystemImagePrompt() ;
    }
    
    public setModelName(modelName: string) {
        this.modelName = modelName;
    }

    public async fetchImages(request: ImageSourceRequest): Promise<ImageData[]> {
        if(!this.falApiKey){
            await this.setFalAiKey()
        }
        if (!this.falApiKey) {
            throw new Error("FAL_AI_KEY is missing or could not be loaded from Secrets Manager");
        }
        fal.config({
             credentials: this.falApiKey
        });

        const result = await fal.subscribe(this.modelName, {
        input: {
            prompt: this.systemPrompt + (request.text ?? request.keywords.join(',')),
            image_size: { width: 1080, height: 1920 }, 
        },
        logs: true,
        onQueueUpdate: (update) => {
            if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
            }
        },
        });
        console.log(result.data);
        console.log(result.requestId);

        return []
    }

    private async setFalAiKey(){
        const key = await getSecretValue('FAL_AI_KEY')
        if (typeof key === "string") {
            this.falApiKey = key.trim()
            return
        }
        this.falApiKey = Object.values(key)[0] as string
    }

    private getDefaultSystemImagePrompt(){
        return [
            "You are generating a high-quality editorial news photograph.",
            "",
            "The image must look like it was captured by a professional photojournalist using a DSLR camera.",
            "",
            "Style requirements:",
            "- Ultra-realistic photography",
            "- Natural lighting",
            "- Authentic skin texture and environmental detail",
            "- Subtle depth of field",
            "- Balanced exposure",
            "- Neutral color grading (no stylized filters)",
            "",
            "Composition:",
            "- Clear primary subject",
            "- Slightly blurred background",
            "- Natural candid body language",
            "- Real-world environment appropriate to the topic",
            "- Framed for social media with negative space for text overlay",
            "",
            "Important:",
            "- No surreal elements unless explicitly required",
            "- No fantasy or illustration style",
            "- No artificial glow or over-processed look",
            "- Avoid stock-photo cheesiness",
            "",
            "Topic:",
        ].join("\n");
    }

}
