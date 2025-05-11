export default interface Media{
    headline: String,
    textSnippet: String,
    sourceURL: String,
    imageURL:String,
    videoURL:String,
    genre:('news' | 'politics' | 'sports' | 'memes' | 'humour' | 'finance' | 'crypto')[],
    sourcedAt:Date,
    sourceName:String
    creditTo:String
}

export default interface Post{

}