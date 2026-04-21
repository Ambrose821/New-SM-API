import { useContext } from "react";
import { MediaApiStateContext } from "@/providers/MediaApiStateProvider";

export default function useMediaApiState(){
    const context = useContext(MediaApiStateContext)
    if(context === undefined){
        throw new Error('useMediaApiState must be used within a MediaApiStateProvider')
    }
    return context
}