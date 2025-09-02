export type Genre = 'news' | 'politics' | 'sports' | 'memes' | 'humour' | 'finance' | 'crypto'

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
    s3_bucket: String, //Should be "mediaapibucket" unless something changes. Debating even having this on this side of the request
    s3_key: String, //Something like "posts/{timeLong}/post.mp4", also not sure if this should be on this side of the request 

    encoder: String, // Should be "libx264"
    preset:String, //Normally "medium",



}

