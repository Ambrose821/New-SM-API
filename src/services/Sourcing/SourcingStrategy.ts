import {getRssFeed} from '../Sourcing/rssHelper/fetchFeed'
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
