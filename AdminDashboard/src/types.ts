export interface Post{
    headline: String,
    description: String|null,
    thumbnailUrl: String |null // thumbnail is the actualy post if no video is provided
    videoUrl : String | null
    mediaType :'Video' | 'Image',
    genre: String[],
    sourcedAt:Date
    imageAttributions: String[] | null,
    videoAttributions: String[]|null,
    audioAttributions: String [] | null,
    posted: Boolean|null

}