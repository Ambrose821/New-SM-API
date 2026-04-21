import { getGenres } from "./posts";
import { getSocialPlatforms } from "./socials";
import { getPipelineOptions} from "./pipeline";

import type { MediaApiState } from "@/types";

export const getApiState = async () =>{

    const apiData = await Promise.all([
        getGenres(),
        getSocialPlatforms(),
        getPipelineOptions(),
    ])

    const mediaState = {
        genres: apiData[0],
        socialPlatforms: apiData[1],
        pipelineOptions: apiData[2]
    } as MediaApiState

    return mediaState

}