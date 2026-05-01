import {getRssFeed} from '../Sourcing/rssHelper/fetchFeed'
import {Media, SourcerRequest} from '../../types';

/** 
 * This strategy pattern use case was intended to abstract the differences in key-value syntax from rss feeds across different source organizatios
 * 
 * It is currently evolving to support sourcing of any (scraping, API calls, RSS, etc) kind while returning common Media Objects.
 * A work in progress parent pipeline context would use this strategy pattern in order to obtain predicatble raw media dat which can be saved to the db
 * and used forwarded through the pipeline
 * 
 * IMPORTANT: Each strategy should, regardless of RSS return format, return a valid object of type Media so that i can be forwarded through the pipeline
 * 
 * **/
export interface SourcingStrategy {
    source(sourceRequest: SourcerRequest):Promise<Media[] |null>;
}

export class nineStrategy implements SourcingStrategy{
    async source(sourceRequest: SourcerRequest):Promise<Media[] |null>{
        //Todo make this strat if you want to use it
      return null
    }
}

export class newsIOstrategy implements SourcingStrategy{

    async source(sourceRequest: SourcerRequest):Promise<Media[] |null>{
         //Todo make this strat if you want to use it
      return null
    }

}

export class RssAppStrategy implements SourcingStrategy{
    async source(sourceRequest: SourcerRequest):Promise<Media[] |null>{

        try{
            const url = sourceRequest.pipeline.source_url
            const genres = sourceRequest.pipeline.genre ?? []
            if(!url){
                throw new Error("Error in RssAppStrategy: SourceRequest for this strategy requires a pipeline with a URL")
            }
            const feed = await getRssFeed(url)
          // console.log(feed)
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
                    creditTo: `${feedItem.creator}\n${feedItem.link}`
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
