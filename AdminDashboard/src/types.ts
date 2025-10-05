export interface Post{
    headline: String,
    description: String|null,
    thumbnailUrl: string |null // thumbnail is the actualy post if no video is provided
    videoUrl : String | null
    mediaType :'Video' | 'Image',
    genre: string[],
    sourcedAt:Date
    imageAttributions: String[] | null,
    videoAttributions: String[]|null,
    audioAttributions: String [] | null,
    posted: Boolean|null

}