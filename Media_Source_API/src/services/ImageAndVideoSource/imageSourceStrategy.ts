import { ImageData } from "../../types";

export type ImageSourceRequest =
    {
          quantity?: number;
          keywords: string[];
          text: string;
          diffusion_prompts?: string[]
      }

export interface ImageSourceStrategy {
    fetchImages(request: ImageSourceRequest): Promise<ImageData[]>;
}
