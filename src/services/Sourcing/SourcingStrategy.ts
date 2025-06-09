import {getRssFeed} from '../Sourcing/rssHelper/fetchFeed'
import {Media,Genre} from '../../types';



/** 
 * This strategy pattern use case is intended to abstract the differences in key-value syntax from rss feeds across different source organizatios
 * 
 * A work in progress parent pipeline context would use this strategy pattern in order to obtain predicatble raw media dat which can be saved to the db
 * and used forwarded through the pipeline
 * 
 * IMPORTANT: Each strategy should, regardless of RSS return format, return a valid object of type Media so that i can be forwarded through the pipeline
 * 
 * **/
export interface RssSourcingStrategy {
    sourceFeed(url:any,genre:Genre[]):Promise<Media[] |null>;
}

export class nineStrategy implements RssSourcingStrategy{
    async sourceFeed(url:any,genres:Genre[]):Promise<Media[] |null>{
        try{
            
            const feedItems = await getRssFeed(url)
            console.log(feedItems)
            return null;

           
        }catch(err){
           // console.error("Error in nineStrategy.sourceFeed(): ",err)
            throw new Error("Error in nineStrategy: " + err)
            return null;
        }
        
    }
}

export class newsIOstrategy implements RssSourcingStrategy{

    async sourceFeed(url:any,genres:Genre[]):Promise<Media[] |null>{

        try {
            return null
            
        } catch (err) {
            throw new Error("Error in newsIOStrategy: " + err);
        }
       
    }

}

export class rssAppStrategy implements RssSourcingStrategy{
    async sourceFeed(url:any,genres:Genre[]):Promise<Media[] |null>{

        try{
            const feed = await getRssFeed(url)
           //console.log(feed)
            const mediaObjects = feed.map((feedItem:any) =>{
                 const mediaObj: Media =
                    {
                    headline:feedItem.title,
                    textSnippet:feedItem.contentSnippet,
                    sourceURL:feedItem.link,
                    imageURL:null,
                    videoURL:null,
                    genre:genres,
                    sourcedAt:new Date(Date.now()),
                    sourceName:feedItem.creator,
                    creditTo: feedItem.creator + "\n"+ feed.link
                }
                return mediaObj
                
            }
            
        )
        return mediaObjects;
        }catch(err){
            throw new Error("Error in rssAppStrategy: " + err)

        }
      
    }
}
