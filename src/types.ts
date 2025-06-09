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
}