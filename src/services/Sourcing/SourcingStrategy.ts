import {getRssFeed} from '../Sourcing/rssHelper/fetchFeed'




/** 
 * This strategy pattern use case is intended to abstract the differences in key-value syntax from rss feeds across different source organizatios
 * 
 * A work in progress parent pipeline context would use this strategy pattern in order to obtain predicatble raw media dat which can be saved to the db
 * and used forwarded through the pipeline
 * 
 * IMPORTANT: Each strategy should, regardless of RSS return format, return a valid object of type Media so that i can be forwarded through the pipeline
 * 
 * **/
interface RssSourcingStrategy {
    sourceFeed(url:any):Promise<Object |null>;
}

export class nineStrategy implements RssSourcingStrategy{
    async sourceFeed(url:any):Promise<Object |null>{
        try{
            
            const feedItems = await getRssFeed(url)
            console.log(feedItems)
            return null;

           
        }catch(err){
            console.error("Error in nineStrategy.sourceFeed(): ",err)
            return null;
        }
        
    }
}

class newsIOstrategy implements RssSourcingStrategy{
    async sourceFeed(url:any):Promise<Object |null>{
        return null
    }

}

class rssAppStrategy implements RssSourcingStrategy{
    async sourceFeed(url:any):Promise<Object |null>{
        return null
    }
}
