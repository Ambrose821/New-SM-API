import type { SourceType } from "../types"
import { RssAppStrategy, SourcingStrategy } from "../services/Sourcing/SourcingStrategy"

const sourceFactory: Record<SourceType, () => SourcingStrategy> = {
    rssApp: () => new RssAppStrategy()
}

export const createSourceStrategy = (source: SourceType):SourcingStrategy =>{
    const strategy = sourceFactory[source]

    if(!strategy){
        throw new Error("Error creating a sourcing strategy for non source type: " + String(source))
    }
    
    return strategy();
}
