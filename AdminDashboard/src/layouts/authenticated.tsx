import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from 'react';
import { useAuth,UserButton,SignOutButton } from "@clerk/clerk-react";

import { SidebarProvider,SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function Authenticated(){

    const {isLoaded,isSignedIn} = useAuth();
    const navigate = useNavigate();

    
    useEffect(()=>{
            if(!isSignedIn && isLoaded){
            navigate('/')
            }
    })
    
    return(
        <div className="min-h-dvh bg-white flex" >
            <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 min-h-dvh overlow-hidden">
                <div className="p-4">
                <SidebarTrigger className="text-foreground"/>
                </div>
                <div className="h-[calc(100dvh-4rem)] overflow-hidden">
                <Outlet />
                </div>
            </main>
            </SidebarProvider>
            
        </div>
       
    )
}
