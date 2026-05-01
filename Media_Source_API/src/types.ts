
export type Genre = 'news' | 'politics' | 'sports' | 'memes' | 'humour' | 'finance' | 'crypto' | 'viral' | 'tech'
export type Platform = 'twitter' | 'facebook' | 'instagram' | 'tiktok' | 'linkedin'
export type SourceType = 'rssApp'
export type ImageSourceType = 'openverse' | 'pixabay' | 'falAI' | 'wikicommons' | 'runware'
export type LLMAgentType = 'gemini-2.5-flash' | 'gemini-3-flash-preview'
export type PipelineFrequency = 'daily' | 'weekly' | 'monthly' | ""

export interface ImageSourceConfig{
    strategy: ImageSourceType,
    //below fields exist because eventually i will allow more customization of pipelines
    model: String | null | undefined,
    systemPrompts: String[] | undefined | undefined,
    promptInfo: String[] | undefined,
}

export interface LLMConfig{
    agent: LLMAgentType,
    // model: String,
}

export interface Media{
    headline: String,
    textSnippet: String,
    sourceURL: String,
    imageURL:String |null,
    videoURL:String | null, //These would be non null in the case that the given media source has public domain image or video
    genre:Genre[],
    sourcedAt:Date,
    sourceName:String
    creditTo:String
}

export interface Post{
    headline: String,
    description: String|null,
    thumbnailUrl: String |null // thumbnail is the actualy post if no video is provided
    videoUrl : String | null
    mediaType :'Video' | 'Image',
    genre: Genre[],
    sourcedAt:Date
    imageAttributions: String[] | null,
    videoAttributions: String[]|null,
    audioAttributions: String [] | null,
    posted: Boolean|null
    pipelineId: string | null

}
export interface NewsContent{
headline: String,
summary: String,
keywords: String[],
highlightWords: String[],
}

export interface ImageData{
    url: String,
    attribution:String |null,
    keyword:String|null

}

export interface Pipeline{
    id: string | undefined |null
    name: string,
    description: string | null,
    source: SourceType
    source_url: string,
    genre: Genre[],
    frequency: PipelineFrequency
    backgroundImageSource: ImageSourceConfig,
    foregroundImageSource: ImageSourceConfig | null,
    llm: LLMConfig,
    socialAccountId: String | null | undefined,
    isActive: Boolean,
}


export interface RenderRequest{

    bg_url: String,
    fg_url: String|null,
    caption: String,
    highlight: String[]
    category: String,
    brand: String,
    
    width: number,
    height:number,
    duration:number
    fps:30,
    
    //Debating moving the below paramters to the api reciever side of the Media Editing API
    audio_path:String|null,
    s3_bucket: String, //Should be "mediaapibucket" unless something changes. Debating even having this on this side of the request
    s3_key: String, //Something like "posts/{timeLong}/post.mp4", also not sure if this should be on this side of the request 

    encoder: String, // Should be "libx264"
    preset:String, //Normally "medium",

}

export interface PipelineRequestData {
    name: string,
    description: string | null,
    source: string
    source_url: string,
    genre: string[],
    frequency: string
    backgroundImageSource: string,
    foregroundImageSource: string | null | undefined,
    llm: string,
    socialAccountId: string | null | undefined,
    isActive: Boolean | null,
}

export interface RenderResponse{
    video: String |null,
    thumbnail: String|null,
    details:String|null
}


export interface SocialAccount{
    _id:String|null|undefined,
    platform: Platform,
    handle: String,
    instagramId: String|null,
}

export interface SourcerRequest{
    pipeline: Pipeline
}
