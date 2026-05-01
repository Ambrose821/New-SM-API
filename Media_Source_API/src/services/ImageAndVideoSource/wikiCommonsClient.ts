import axios from "axios";

import { ImageData } from "../../types";
import { ImageSourceRequest, ImageSourceStrategy } from "./imageSourceStrategy";

type CommonsMetadataValue = {
    value?: string;
}

type CommonsImageInfo = {
    url?: string;
    thumburl?: string;
    mime?: string;
    extmetadata?: Record<string, CommonsMetadataValue>;
}

type CommonsPage = {
    title?: string;
    imageinfo?: CommonsImageInfo[];
}

const COMMONS_API_URL = "https://commons.wikimedia.org/w/api.php";
const COMMERCIAL_LICENSE_PATTERNS = [
    /^cc0\b/i,
    /^cc by\b/i,
    /^cc-by\b/i,
    /^cc by-sa\b/i,
    /^cc-by-sa\b/i,
    /public domain/i,
]

const BLOCKED_LICENSE_PATTERNS = [
    /\bnc\b/i,
    /non[\s-]?commercial/i,
    /\bnd\b/i,
    /no[\s-]?derivatives/i,
    /fair use/i,
]

export class WikiCommonsImageStrategy implements ImageSourceStrategy {
    private buildSearchQueries(keywords: string[]) {
        const cleanedKeywords = keywords
            .map((keyword) => keyword.trim())
            .filter(Boolean)
            .slice(0, 3);

        if (!cleanedKeywords.length) {
            throw new Error("WikiCommonsClient requires a keywords array request");
        }

        const queries = [
            cleanedKeywords.join(" "),
            cleanedKeywords[0],
        ];

        return Array.from(new Set(queries)).map((query) => `${query} filetype:bitmap`);
    }

    private isCommerciallyUsable(metadata: Record<string, CommonsMetadataValue> | undefined) {
        const licenseName = this.cleanMetadataValue(metadata?.LicenseShortName?.value ?? "");
        const usageTerms = this.cleanMetadataValue(metadata?.UsageTerms?.value ?? "");
        const licenseText = `${licenseName} ${usageTerms}`;

        if (!licenseText.trim()) {
            return false;
        }

        if (BLOCKED_LICENSE_PATTERNS.some((pattern) => pattern.test(licenseText))) {
            return false;
        }

        return COMMERCIAL_LICENSE_PATTERNS.some((pattern) => pattern.test(licenseText));
    }

    private cleanMetadataValue(value: string) {
        return value
            .replace(/<[^>]*>/g, " ")
            .replace(/&quot;/g, "\"")
            .replace(/&#039;/g, "'")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/\s+/g, " ")
            .trim();
    }

    private buildAttribution(page: CommonsPage, imageInfo: CommonsImageInfo) {
        const metadata = imageInfo.extmetadata;
        const title = this.cleanMetadataValue(metadata?.ObjectName?.value ?? page.title ?? "Wikimedia Commons image");
        const artist = this.cleanMetadataValue(metadata?.Artist?.value ?? "");
        const credit = this.cleanMetadataValue(metadata?.Credit?.value ?? "");
        const license = this.cleanMetadataValue(metadata?.LicenseShortName?.value ?? "");
        const licenseUrl = metadata?.LicenseUrl?.value ?? "";
        const author = artist || credit || "Wikimedia Commons contributor";

        return [title, author, license, licenseUrl]
            .filter(Boolean)
            .join(" | ");
    }

    private async search(query: string, limit: number) {
        const response = await axios.get(COMMONS_API_URL, {
            params: {
                action: "query",
                format: "json",
                formatversion: 2,
                generator: "search",
                gsrnamespace: 6,
                gsrlimit: limit,
                gsrsearch: query,
                prop: "imageinfo",
                iiprop: "url|mime|size|extmetadata",
                iiurlwidth: 1080,
            },
            headers: {
                "User-Agent": "New-SM-API/1.0 image-source-strategy",
            },
        });

        return (response.data?.query?.pages ?? []) as CommonsPage[];
    }

    public async fetchImages(request: ImageSourceRequest): Promise<ImageData[]> {
        const quantity = request.quantity ?? 1;
        const searchQueries = this.buildSearchQueries(request.keywords ?? []);
        const results: ImageData[] = [];
        const seenUrls = new Set<string>();

        for (const query of searchQueries) {
            const pages = await this.search(query, Math.max(quantity * 8, 12));

            for (const page of pages) {
                const imageInfo = page.imageinfo?.[0];
                const imageUrl = imageInfo?.thumburl ?? imageInfo?.url;

                if (!imageInfo?.mime?.startsWith("image/") || !imageUrl || seenUrls.has(imageUrl)) {
                    continue;
                }

                if (!this.isCommerciallyUsable(imageInfo.extmetadata)) {
                    continue;
                }

                seenUrls.add(imageUrl);
                results.push({
                    url: imageUrl,
                    attribution: this.buildAttribution(page, imageInfo),
                    keyword: query.replace(" filetype:bitmap", ""),
                } as ImageData);

                if (results.length >= quantity) {
                    return results;
                }
            }
        }

        return results;
    }
}
