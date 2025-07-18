import RssParser from 'rss-parser'


export async function getRssFeed(url: string): Promise<any|null> {
    const parser = new RssParser();
    try{
        const feed = await parser.parseURL(url)
        return feed.items;
    }catch(err){
        console.error("Error at fetchRssStrategy.getFeed(): ",err)
        return null
    }
    
}

