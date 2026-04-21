
export interface Post{
    _id: String|null|undefined,
    headline: String,
    description: String|null,
    thumbnailUrl: string |null // thumbnail is the actualy post if no video is provided
    videoUrl : string | null
    mediaType :'Video' | 'Image',
    genre: string[],
    sourcedAt:Date
    imageAttributions: String[] | null,
    videoAttributions: String[]|null,
    audioAttributions: String [] | null,
    posted: Boolean|null
    

}

export interface SocialAccount {
    _id:String|null|undefined
    handle: string;
    platform: "instagram" | "twitter" | "facebook" | "tiktok" | "linkedin" | "youtube";
    icon: React.ComponentType<{ className?: string }>;
}

export interface InstagramAccount extends SocialAccount {
    instagramId: string;
    platform: 'instagram';
}

export type TargetSocialContextType ={
    socalAccount: SocialAccount | null;
    setSocialAccount: (account: SocialAccount | null) => void;
}

export type PipelineOptions = {

    sources: string[],
    imageSources: string[],
    llmAgents: string[],
    frequencies: string[],
}

export type MediaApiState = {
    genres : string [];
    socialPlatforms : "instagram" | "twitter" | "facebook" | "tiktok" | "linkedin" | "youtube";
    pipelineOptions: PipelineOptions
}