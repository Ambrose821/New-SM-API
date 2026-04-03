import { ImageData } from "../../types";

export type ImageSourceRequest =
    | {
          quantity?: number;
          keywords: string[];
          text?: never;
      }
    | {
          quantity?: number;
          text: string;
          keywords?: never;
      };

export interface ImageSourceStrategy {
    fetchImages(request: ImageSourceRequest): Promise<ImageData[]>;
}
