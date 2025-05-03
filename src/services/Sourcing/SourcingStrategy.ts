interface RssSourcingStrategy {
    sourceFeed(feed:any):Object |null;
}

class nineStrategy implements RssSourcingStrategy{
    sourceFeed(feed:any):Object |null{
        return null
    }
}

class newsIOstrategy implements RssSourcingStrategy{
    sourceFeed(feed:any):Object |null{
        return null
    }

}

class rssAppStrategy implements RssSourcingStrategy{
    sourceFeed(feed:any):Object |null{
        return null
    }
}