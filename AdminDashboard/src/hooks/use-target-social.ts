import { TargetSocialContext } from "@/providers/TargetSocialProvider";
import { useContext } from "react";

export function useTargetSocial(){
    const context = useContext(TargetSocialContext);
    if(context === undefined){
        throw new Error('useTargetSocial must be used within a TargetSocialProvider');
    }
    return context;
}