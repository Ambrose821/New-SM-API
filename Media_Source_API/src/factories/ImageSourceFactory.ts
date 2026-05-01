import { FalAIImageStrategy } from "../services/ImageAndVideoSource/falAIClient"
import { ImageSourceStrategy } from "../services/ImageAndVideoSource/imageSourceStrategy"
import { OpenverseImageStrategy } from "../services/ImageAndVideoSource/openVerseClient"
import PixabayImageStrategy from "../services/ImageAndVideoSource/pixaBayClient"
import { RunwareImageStrategy } from "../services/ImageAndVideoSource/runwareClient"
import { WikiCommonsImageStrategy } from "../services/ImageAndVideoSource/wikiCommonsClient"
import type {ImageSourceType} from "../types"

const imageSourceStrategyFactory: Record<ImageSourceType, () => ImageSourceStrategy > ={
    falAI : () => new FalAIImageStrategy(),
    openverse: () => new OpenverseImageStrategy(),
    pixabay: () => new PixabayImageStrategy(),
    wikicommons: () => new WikiCommonsImageStrategy(),
    runware: () => new RunwareImageStrategy()
}

export const createImageSourceStrategy = (value: ImageSourceType) =>{
    const strategy = imageSourceStrategyFactory[value]

    if(!strategy){
        throw new Error("Error creating an image sourcing strategy for non image source type: " + value)
    }
    return strategy()
}
