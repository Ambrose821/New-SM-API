import { createContext, useEffect, useState } from "react";
import type { MediaApiState} from "@/types";
import { getApiState } from "../util/api/mediaApiState";


export const MediaApiStateContext = createContext<MediaApiState|undefined|null>(undefined)

export function MediaApiStateProvider({children}: {children: React.ReactNode}){
    const [apiState, setApiState] = useState<MediaApiState | null >(null)

    useEffect(() =>{
        async function retrieveApiState(){
            const state = await getApiState()
            setApiState(state)
        }
        retrieveApiState()
    }, [])


    return(
        <MediaApiStateContext.Provider value= {apiState}>
            {children}
        </MediaApiStateContext.Provider>

    )

}
