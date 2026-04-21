/*
 This provider is used to keep track of the target social account.
 This way the app knows the context of which social media account to post to,
 create pipelines for, etc. Among many different accounts
*/

import {createContext,useState } from "react";


import type { SocialAccount, TargetSocialContextType } from "@/types";

export const TargetSocialContext = createContext<TargetSocialContextType|undefined>(undefined)

export const TargetSocialProvider = ({children}: {children: React.ReactNode }) =>{

    const [targetSocial, setTargetSocial] = useState<SocialAccount|null>(null)

    return (
    <TargetSocialContext.Provider value={{socalAccount:targetSocial, setSocialAccount:setTargetSocial}}>
        {children}
    </TargetSocialContext.Provider>
    )

}






