interface SourcingStrategy {
    sourceFeed(feed:any):Object |null;
}

class nineStrategy implements SourcingStrategy{
    sourceFeed(feed:any):Object |null{
        return null
    }
}

class newsIOstrategy implements SourcingStrategy{
    sourceFeed(feed:any):Object |null{
        return null
    }

}

class rssAppStrategy implements SourcingStrategy{
    sourceFeed(feed:any):Object |null{
        return null
    }
}