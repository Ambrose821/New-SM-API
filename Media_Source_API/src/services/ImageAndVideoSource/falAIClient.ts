import { ImageData } from "../../types";
import { ImageSourceRequest, ImageSourceStrategy } from "./imageSourceStrategy";
import  { fal } from "@fal-ai/client";


import { getSecretValue } from "../../config/secrets-manager"
export interface FalAIClientOptions {
    modelName?: string;
    systemPrompt?: string;
}

type FalImageResult = {
    images?: {
        url?: string;
        width?: number;
        height?: number;
        content_type?: string;
    }[];
};

export class FalAIImageStrategy implements ImageSourceStrategy {
    private modelName: string;
    private systemPrompt: string;
    private falApiKey: string | null = null;

    public constructor(options: FalAIClientOptions = {}) {
        this.modelName = options.modelName ?? "openai/gpt-image-2";
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
            throw new Error("FAL_AI_KEY is missing or could not be loaded");
        }
        fal.config({
             credentials: this.falApiKey
        });

        const promptParts = request.diffusion_prompts?.filter(Boolean).length
            ? request.diffusion_prompts.filter(Boolean)
            : request.keywords.filter(Boolean);
        if (!promptParts.length) {
            throw new Error("FalAIImageStrategy requires diffusion prompts or keywords");
        }
        const prompt = [
            this.systemPrompt,
            `Image concept:\n${promptParts.join("\n")}`,
            `Exclude from the generated image: ${this.getDefaultNegativePrompt()}`,
        ].join("\n\n");
        const result = await fal.subscribe(this.modelName, {
        input: {
            prompt,
            image_size: { width: 1024, height: 1824 },
            quality: "medium",
            num_images: request.quantity ?? 1,
            output_format: "jpeg",
        },
        logs: true,
        onQueueUpdate: (update) => {
            if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
            }
        },
        });
        const data = result.data as FalImageResult;
        console.log(data);
        console.log(result.requestId);

        return (data.images ?? [])
            .slice(0, request.quantity ?? 1)
            .filter((image) => image?.url)
            .map((image) => ({
                url: image.url as string,
                attribution: "",
                keyword: request.text ?? request.keywords[0] ?? null
            } as ImageData))
    }

    private async setFalAiKey(){
        const key = await getSecretValue('FAL_AI_KEY')
        if (typeof key === "string") {
            this.falApiKey = key.trim()
            return
        }
        this.falApiKey = Object.values(key)[0] as string
    }

    private getDefaultSystemImagePrompt() {
        return [
            "Create a striking vertical social-media image that catches attention at phone size and makes the viewer want the story behind it.",
            "Use the supplied concept to choose one dominant subject and at most one secondary element. Make the core subject recognizable; leave the explanation to the caption.",
            "Create one clear visual hook through framing, a revealing detail, or the relationship between the two elements. Keep the background simple and quiet; omit extra contextual props and symbols even if the concept mentions several.",
            "A small theatrical touch in lighting, shadow, perspective, or staging is welcome. Use photographic or conceptual art direction with convincing materials. Avoid turning routine news into a threatening or catastrophic scene.",
            "Preserve the concept's factual core and real physical properties. Never invent events, damage, scientific mechanisms, product capabilities, brands, or branded buildings. Use only authentic relevant logos and product markings; software may appear as its official logo on a simple screen.",
            "For person-led stories, use an associated non-human object, logo, or place. Compose one edge-to-edge 9:16 scene with the focal elements in the upper 60 percent and a quiet lower area for the headline added later.",
        ].join("\n");
    }

    private getDefaultNegativePrompt() {
        return [
            "people, faces, silhouettes, or body parts",
            "clutter, collages, or split screens",
            "headlines, captions, or decorative text",
            "charts, infographics, or fabricated data",
            "invented interfaces, tickets, or documents",
            "watermarks or borders",
        ].join(", ");
    }


}
