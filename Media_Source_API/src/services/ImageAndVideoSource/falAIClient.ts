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
            `Article-specific image brief:\n${promptParts.join(". ")}`,
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
            "Create a premium vertical editorial image for an engaging social-media post.",
            "Treat the article-specific brief as the source of truth. Build the image from its named subject, recognition anchor, article-supported visuals, and supported action.",
            "Render the dominant and supporting recognition anchors together according to the stated visual relationship so the specific subject and broader domain are understandable without a headline. Integrate them naturally in one physical scene, never as floating icons or separate panels.",
            "Follow the selected visual strategy, mood, and composition literally. Do not replace them with a generic cinematic technology aesthetic.",
            "Prefer the most engaging and recognizable visual representation of the story. Use symbolism only when the brief explicitly selects symbolic_metaphor.",
            "Accurately include relevant named brand or company logos, products, buildings, landmarks, vehicles, machinery, and national symbols when requested. Never invent a company, logo, product, building sign, or wordmark.",
            "Do not depict people, public figures, faces, portraits, silhouettes, crowds, hands, or human body parts; represent person-led stories with associated non-human visual anchors.",
            "Use credible editorial photography or restrained photoreal editorial art, realistic materials, believable environments, and article-appropriate lighting.",
            "When the brief selects product_showcase or object_still_life, create a believable art-directed photograph with one dominant product, article-supported secondary objects, consistent scale, natural overlap, one coherent light source, and realistic depth of field.",
            "Screens may remain visually active: show an exact requested official logo, a simple branded splash screen, or non-informational article-relevant imagery. Never invent an app interface, website, operating-system screen, notification, menu, dashboard, trading terminal, or control panel.",
            "Never render factual-looking unverified data, including charts, candlesticks, price tickers, share prices, percentages, exchange rates, KPIs, rankings, scores, dates, tickets, receipts, documents, or numerical metrics.",
            // "Do not add lightning, storms, glowing energy, particles, futuristic structures, or dramatic effects unless the article-specific brief supports them.",
            "Create one coherent scene rather than a montage. Compose edge-to-edge in vertical 9:16 and keep the primary subject within the upper 60 percent for the post layout.",
            "Do not add headlines, captions, statistics, charts, interfaces, borders, or watermarks. Authentic requested logos and product markings are allowed.",
        ].join("\n");
    }

    private getDefaultNegativePrompt() {
        return [
            "people",
            "person",
            "public figure",
            "face",
            "portrait",
            "crowd",
            "human silhouette",
            "hands",
            "human body parts",
            "stock photo",
            "generic office workers",
            "generic handshake",
            "collage",
            "split screen",
            "poster layout",
            "headline",
            "caption",
            "large text overlay",
            "random lettering",
            "chart",
            "infographic",
            "user interface",
            "trading dashboard",
            "candlestick chart",
            "stock ticker",
            "share price",
            "percentage",
            "KPI",
            "analytics dashboard",
            "ticket",
            "receipt",
            "fabricated metrics",
            "watermark",
            "border",
            "low detail",
            "distorted face",
            "extra fingers",
        ].join(", ");
    }


}
